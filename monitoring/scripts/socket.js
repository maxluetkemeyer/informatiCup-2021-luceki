/* eslint-disable no-undef */
const socket = io();

const queueTimer = new Timer(document.getElementById("startButtonText"), 1000, false);
const moveTimer = new Timer(document.getElementById("timeLeftTimer"), 1, true);



// on init
socket.on("queue", () => {
    alreadyInit = false; ingame = true;
    round = 0; roundDisplay.innerHTML = "";
    loading_spinner.style.display = "block";
    //setPlayerClassElementsFontSize("1.6vw");

    queueTimer.resetTimer();
    queueTimer.startTimer();
    moveTimer.resetTimer();

    document.getElementById("startButton").style.background = "grey";
    for(let i = 1; i <= 6; i++){
        document.getElementById("player"+i+"Container").style.display = "none";
        document.getElementById("player"+i+"Container").classList.remove("animate__fadeInLeft");
        document.getElementById("player"+i+"you").style.display = "none";
        
    }
});

socket.on("sendMove", (move) => {
    //moveTimer.pauseTimer();

    const moveNode = document.createElement("p");
    const textnode = document.createTextNode(move);
    moveNode.appendChild(textnode);
    moveNode.classList.add("animate__animated");
    //moveNode.classList.add("animate__fadeInRight");
    moveNode.classList.add("animate__faster");
    const moveHistory = document.getElementById("moveHistory");
    moveHistory.insertBefore(moveNode, moveHistory.childNodes[3]);
    // chart
});

// on update
socket.on("update", (gameData) => {
    moveTimer.resetTimer();
    moveTimer.startTimer();

    setGameData(gameData);
    getMultiplyer();

    drawPlayerlist();
    if(!alreadyInit){
        alreadyInit = true;
        initialize();
        //document.getElementById("startButton").style.background = "grey";
        document.getElementById("startButtonText").innerHTML = "running";
        audioUp.play();
    }
    // muss nur einmal ausgefuert werden
    
    loading_spinner.style.display = "none";
    queueTimer.pauseTimer();

    roundDisplay.innerHTML = "Round "+round;

    setCanvas();
    draw();
    doTacticDataThings();
    
});

socket.on("status", (options) => {
    if(options.autostart){
        document.getElementById("autostartCheck").checked = true;  
    }else {
        document.getElementById("autostartCheck").checked = false;
    }
    console.log("Server status autostart: "+ options.autostart);
});

socket.on("gameEnd", (option) => {
    if(option == "finaly"){
        ingame = false;

        document.getElementById("startButtonText").innerHTML = "Start Queue";
        document.getElementById("startButton").style.background = "#70AD47";

        queueTimer.resetTimer();
        moveTimer.resetTimer();

        //setPlayerClassElementsFontSize("0.7vw");
        audioDown.play();
    }
    if(option == "eliminated"){
        audioEliminated.play();
    }

    moveTimer.pauseTimer();
});

socket.on("message", (message) => {
    console.log(message);
    const messages = document.getElementById("messages");
    const messageNode = document.createElement("p");
    const messageText = document.createTextNode(message);
    messageNode.appendChild(messageText);
    messageNode.classList.add("message");
    messageNode.classList.add("animate__animated");
    messageNode.classList.add("animate__fadeIn");
    messages.appendChild(messageNode);
    setTimeout(() => {
        messageNode.classList.add("animate__fadeOut");
        setTimeout(() => {
            messageNode.parentNode.removeChild(messageNode);
        },2000);
    },6000);
});


socket.on("tacticData", (data) => {
    addTableData(data.calcTime);
    tacticData = data.dataToSend;
});

/**
 * If there is tacticData of a specific tactic:
 * dangerFields:
 * Draws a heatmap.
 */
const doTacticDataThings = () => {
    if(tacticData == undefined) return;

    if(tacticData.name === "dangerFields"){
        const result = tacticData.result;
        const heatMap = tacticData.heatMap;
        if(document.getElementById("dangerFields_showHeatMap").checked == true){
            for(let y = 0; y < height; y++){
                for(let x = 0; x < width; x++){
                    ctx.beginPath();
                    ctx.rect(x*multiplyer, y*multiplyer, multiplyer, multiplyer);
                    if(heatMap[y][x] == 0 || heatMap[y][x] == 1){
                        continue; // ueberspringen
                    }else {
                        //ctx.fillStyle = pSBC(tacticData.heatMap[y][x] / 10, "#283593");
                        const transparentFactor = 1 - (1 / heatMap[y][x]);
                        ctx.fillStyle = pSBC(0.8, "rgba(40,53,147, "+transparentFactor+")", "rgba(40,53,147, 0.1)");
                    }
                    ctx.fill();
                }
            }
        }
        if(document.getElementById("dangerFields_showGoalFields").checked == true){ //Weg Anzeigen
            const goalFields = tacticData.goalFields;
            for(let i = 0; i < goalFields.length; i++){
                ctx.beginPath();
                //x y vertauscht
                ctx.rect(goalFields[i].newX*multiplyer, goalFields[i].newY*multiplyer, multiplyer, multiplyer);
                ctx.fillStyle = "#f98fff";
                ctx.fill();
            }
        } 
        //ACHTUNG: x, y vertauscht!!!!
        if(document.getElementById("dangerFields_showPath").checked == true){ //Weg Anzeigen
            for(let i = 0; i < result.length; i++){
                ctx.beginPath();
                ctx.rect(result[i].y*multiplyer, result[i].x*multiplyer, multiplyer, multiplyer);
                ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
                ctx.fill();
            }
        } 
        if(document.getElementById("dangerFields_showGoal").checked == true){ //Weg Anzeigen
            const lastIndex = result.length-1;
            ctx.beginPath();
            ctx.rect(result[lastIndex].y*multiplyer, result[lastIndex].x*multiplyer, multiplyer, multiplyer);
            ctx.fillStyle = "#DF14AD";
            ctx.fill();
            
        }
        

        
    }
};