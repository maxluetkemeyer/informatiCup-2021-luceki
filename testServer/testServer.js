//npm
import * as websocket from 'ws';

//imports
import Game from "./game";

//variables
let wss;
let pWs, moves, round;
/**
 * @type {Game}
 */
let myGame;

//initialize server
const init = () => {
    pWs = new Array(6);
    myGame = new Game();
    moves = getNewMoveArray();
    round = 0;
    console.log("[testServer]: initialized");

    wss = new websocket.Server({port: 3333}, () => {
        console.log("[testServer]: started");
    });
    wss.on('connection', (ws) => {
        setWs(ws);
        
        tryStart();
    });
}

//set player connections
const setWs = (ws) => {
    for(let i = 0; i < 6; i++){
        if(pWs[i] == undefined){
            pWs[i] = ws;
            pWs[i].on('message', (msg) => {
                const move = JSON.parse(msg).action;
                moves[i] = move;
                testNextRound();
                testGameEnd();
            });
            console.log("[testServer]: pWs " + i + " (player "+(i+1)+")");
            break;
        }
    }
};

const getNewMoveArray = () => {
    let array = new Array(6);
    for(let i = 0; i < array.length; i++){
        array[i] = "";
    }
    return array;
};

const tryStart = () => {
    if(pWs[5] == undefined){
        return;
    }
    
    setTimeout(() => {
        broadcastGameData();
    }, 100);
};

const testNextRound = () => {
    for(let i = 0; i < 6; i++){
        if(!myGame.players[5].active){
            wss.close();
            init();
            break;
        }
        if(myGame.players[i].active){ //ich glaube hier haengt er noch
            
            if(moves[i] == ""){
                return;
            }
        }
    }
    

    round++;
    const data = myGame.createGameDataArray();
    myGame.executeMoves(moves, data[0], round);
    moves = getNewMoveArray();
    broadcastGameData();
};

const testGameEnd = () => {
    let activePlayers = 0;
    for(let i = 0; i < 6; i++){
        if(myGame.players[i].active){
            activePlayers++;
        }
    }

    if(activePlayers <= 1){
        console.error("KEINE AKTIVEN SPIELER MEHR");
        wss.close();
        init();
    }
}

const broadcastGameData = () => {
    let data = myGame.createGameData();
    for(let i = 0; i < 6; i++){ //6
        let wsClient = pWs[i];
        //if (wsClient.readyState === websocket.OPEN) { //muss noch getestet werden
        if(wsClient == undefined){
            console.error("broadCastGameData Aufruf nicht geplant!");
            return;
        }
        wsClient.send(JSON.stringify(data[i]));
        //}
        
    }
};

init();