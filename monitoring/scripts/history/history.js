/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

/**
 * Handels the play auto function
 */
const playHistory = () => {
    if(runningIntervall != undefined){
        clearInterval(runningIntervall);
        console.log("stop " + runningIntervall);
        runningIntervall = undefined;
    }else {
        myLoop();
    }
   
};

/**
 * Creates an intervall loop and draws every round after and after
 */
const myLoop = () => {
    round = 0;
    const speedRange = document.getElementById("playSpeed");

    runningIntervall = setInterval(function(){ 
        setGameData(rounds[round]);
        drawPlayerlist();
        if(!alreadyInit){
            alreadyInit = true;
            initialize();
        }
        roundDisplay.innerHTML = "Round "+(round+1);
        draw(round);
        round++;
    }, speedRange.max - speedRange.value);
};

/**
 * Updates the game field
 * @param {number} round 
 */
const update = (round) => {
    setGameData(rounds[round]);
    getMultiplyer();
    drawPlayerlist();

    if(!alreadyInit){
        alreadyInit = true;
        initialize();

        setCanvas();
    }
    //setCanvas();

    roundDisplay.innerHTML = "Round "+round;

    draw(round);
};



//#################### History Draw Functions ######################

/**
 * Creates Canvas and paint a white field
 */
const drawInit = () => {
    setCanvas();

    ctx.beginPath();
    ctx.rect(0, 0, width*multiplyer, height*multiplyer);
    ctx.fillStyle = "white";
    ctx.fill();
};

/**
 * Draws a cells array on the field with lightend colors
 * @param {array} cells 
 */
const drawBg = (cells) => {
    for(var y = 0; y < height; y++){
        for(var x = 0; x < width; x++){
            ctx.beginPath();
            ctx.rect(x*multiplyer, y*multiplyer, multiplyer, multiplyer);
            ctx.fillStyle = pSBC(0.4, getFillColor(cells[y][x]));
            ctx.fill();
        }
    }
};

/**
 * Draws a special round on the field. If round < lastRound it resets the field before.
 * @param {number} round 
 */
const draw = (round) => {
    if(round < lastRound){
        ctx.beginPath();
        ctx.rect(0, 0, width*multiplyer, height*multiplyer);
        ctx.fillStyle = "white";
        ctx.fill();
        
    }
    drawBg(endTableau);
    lastRound = round;

    for(let i = 0; i <= round; i++){
        Object.entries(rounds[i].players).forEach((item, index) => {
            ctx.beginPath();
                ctx.rect(item[1].x*multiplyer, item[1].y*multiplyer, multiplyer, multiplyer);
                let playerid = parseInt(item[0]);
                ctx.fillStyle = getFillColor(playerid);
                ctx.fill();      
        });
    }

    // draw heads
    Object.entries(rounds[round].players).forEach((item, index) => {
        let x = item[1].x; // object.entries gibt ein Array ([0] ist Index und [1] ist Value)
        let y = item[1].y;

        ctx.beginPath(); // path im Sinne von Zeichnung
        ctx.arc(x*multiplyer+(multiplyer/2), y*multiplyer+(multiplyer/2), (multiplyer/4), 0, (multiplyer/4) * Math.PI);
        ctx.fillStyle = "white";
        ctx.fill();
    });
    
};