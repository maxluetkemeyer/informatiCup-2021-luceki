/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/**
 * Variablen und Konstanten
 * Init
 * Get Game List
 * Get Round List of a game
 * Play Button
 * History Draw Functions
 */

// variablen und konstanten
let socket = io();
let rounds = [];
let lastRound = -1;
let alreadyInit = false;
let runningIntervall;
let endTableau;
const roundList = document.getElementById("roundList");
const gameInfo = document.getElementById("gameInfo");

////#################### Init ######################################

socket.emit("getHistoryList", {cool:1});

//#################### Get Game List ###############################

socket.on("getHistoryList", (history) => {
    document.getElementById("loading_spinner_history").style.display = "none";
    gameInfo.innerHTML = "Choose Game";
    history.forEach((item, index) => {
        const date = new Date(item.createdAt);
        //document.getElementById("rightSideBar").innerHTML += index + ":" + item + "<br>";
        var node = document.createElement("LI");
        node.setAttribute("value", item._id);
        node.addEventListener("click", (e) => { onGameClick(e); }, false);
        var textnode = document.createTextNode(new Date(item.createdAt).toUTCString());
        node.appendChild(textnode);

        document.getElementById("historyList").appendChild(node);
        
    });
});

/**
 * Load game by clicked gameid
 * @param {Object} e 
 */
const onGameClick = (e) => {
    e = e || window.event;
    var target = e.target || e.srcElement,
        value = target.getAttribute("value"); //gameId
        socket.emit("getGame", value);
};

//#################### Get Round List of a game ####################

socket.on("getGame", (gameProtocol, tableau) => {
    endTableau = tableau;
    cells = tableau;
    rounds = gameProtocol.rounds;
    roundList.innerHTML = "";
    rounds.forEach((item, index) => {
        var node = document.createElement("LI");
        node.setAttribute("value", index);
        
        node.addEventListener("click", (e) => { onRoundClick(e); }, false);
        var textnode = document.createTextNode(index);
        node.appendChild(textnode);
        //document.getElementById("roundList").appendChild(node);
        
        roundList.insertBefore(node, roundList.childNodes[0]);
    });
    setGameData(rounds[0]);
    if(gameProtocol.tactic){
        gameInfo.innerHTML = gameProtocol.tactic;
    }else {
        gameInfo.innerHTML = "No tactic given";
    }
    getMultiplyer();
    setCanvas();
    //drawInit();
    
    for(let i = 1; i <= 6; i++){
        document.getElementById("player"+i+"Container").style.display = "none";
        document.getElementById("player"+i+"Container").classList.remove("animate__fadeInLeft");
        document.getElementById("player"+i+"you").style.display = "none";
        
    }
    initialize();
    drawPlayerlist();
    drawBg(endTableau);
});

/**
 * Calls update round with clicked round
 * @param {Object} e 
 */
const onRoundClick = (e) => {
    e = e || window.event;
    var target = e.target || e.srcElement,
        value = target.getAttribute("value"); //gameId
    update(value);
};