/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const playerlist = document.getElementById("playerlist");
const playerClassElements = document.getElementsByClassName("player");
const loading_spinner = document.getElementById("loading_spinner");
const roundDisplay = document.getElementById("roundDisplay");
let width, height, cells, players, you, running, deadline, round = 0;
let cv, ctx, multiplyer;


/**
 * Updates the game Variables
 * @param {Object} gameData Object with all the game Data
 */
const setGameData = (gameData) => {
    width = gameData.width;
    height = gameData.height;
    if(gameData.cells != undefined){
        cells = gameData.cells;
    }
    players = gameData.players;
    you = gameData.you;
    running = gameData.running;
    deadline = gameData.deadline;
    if(gameData.round != undefined){
        round = gameData.round;
    }
    
};

/**
 * Refreshes the field where to draw
 */
const setCanvas = () => {
    // delete
    if(cv != undefined){
        cv.parentNode.removeChild(cv);
    }
    // create
    cv = document.createElement("canvas");
    ctx = cv.getContext("2d");
    cv.setAttribute("width", width*multiplyer);
    cv.setAttribute("height", height*multiplyer);
    // clear field
    document.getElementById("field").innerHTML = "";
    // canvas in field setzen
    document.getElementById("field").appendChild(cv);
};

/**
 * function gets size of fields based on window size
 */
const getMultiplyer = () => {
    let rows = height-1;
    let columns = width-1;
    let maxFieldWitdh = 0.6*document.body.offsetWidth;
    let maxFieldHeight = 0.85*document.body.offsetHeight;
    let newMultiplyer = Math.floor(Math.min(maxFieldHeight/rows, maxFieldWitdh/columns));
    multiplyer = newMultiplyer;
};

/**
 * Initializes the sidebar player board
 */
const initialize = () => {
    for (const [key, value] of Object.entries(players)) {
        document.getElementById("player"+key+"Container").style.display = "flex";
        document.getElementById("player"+key+"Container").classList.add("animate__animated");
        document.getElementById("player"+key+"Container").classList.add("animate__fadeInLeft");
    }
   document.getElementById("player"+you+"you").style.display = "flex";
   document.getElementById("player"+you+"you").classList.add("animate__animated");
   document.getElementById("player"+you+"you").classList.add("animate__fadeIn");
};


window.addEventListener("resize", function resize(){
    if(cv != undefined){
        getMultiplyer();
        setCanvas();
        console.log("redrawing");
        draw();
    }
});

/**
 * Updates the sidebar player board
 */
const drawPlayerlist = () => {
    for (const [key, value] of Object.entries(players)) {
        let anzeigeName = key;
        let active = "active";
        if(players[key].name != undefined && players[key].name != ""){
            anzeigeName = players[key].name;
            setPlayerClassElementsFontSize("0.7vw");
        }else {
            setPlayerClassElementsFontSize("1.6vw");
        }
        if(!players[key].active){
            active = "out";
        }
        document.getElementById("player"+key).innerHTML = anzeigeName+" - "+active;
    }
};

/**
 * Returns the fill color for drawing
 * @param {number} playerId number from 0 to 6
 * @return {string} hexcolor
 */
const getFillColor = (playerId) => {
    switch(playerId) {
        case 0:
            return "#fff";
        case 1:
            return "#00B0F0";
        case 2:
            return "#00B050";
        case 3:
            return "#FFC000";
        case 4:
            return "#FF3300";
        case 5:
            return "#7030A0";
        case 6:
            return "#002060";
        default:
            return "#c5f542"; //Fehler
    }
};

/**
 * applies a new fontSize to the player board
 * @param {number} size fontsize to apply
 */
const setPlayerClassElementsFontSize = (size) => {
    for (let element of playerClassElements) {    
        element.style.fontSize = size;
    }
};