/* eslint-disable no-import-assign */
//npm
import WebSocket from "ws";
// eslint-disable-next-line no-unused-vars
import * as colors from "colors";

//imports
import tacticController from "./tacticController";
import * as monitoring from "./monitoring/monitoring.js";
import * as db from "./database/db.js";
import {parseArguments} from "./misc/parser";
import {shuffleArray} from "./utils";

//variables
const args = parseArguments();
if(args.autoStart != "no"){
	setTimeout(() => {
		monitoring.autostart = true;

		if(args.autoStart == "dontHit"){
			const values = shuffleArray([0,1,2]);
			const options = {
				tactic: "dontHit",
				pattern: {
					front: values[0],
					left: values[1],
					right: values[2]
				}
			};
			startGame(options);
		}
	}, 2000);
	
}
if(process.env.URL){
	args.url = process.env.URL;
}
if(process.env.KEY){
	args.key = process.env.KEY;
}
if(process.env.TIME_URL){
	args.timeUrl = process.env.TIME_URL;
}
console.log(`args: ${JSON.stringify(args, null, 2)}`);
let ws;
const tc = new tacticController();
monitoring.initWebserver(args.clientPort);
let isTest = ((args.test == 0) ? false : true);

let rounds = [];
let cells = [];
let endedOnError = false;
let eliminated = false;
let round = 0;


/**
 * Creates a WebSocket Client instance,
 * initiliazes the tacticController and 
 * defines the WebSocket Client
 * @param {Object} options 
 */
const startGame = (options) => {
	ws = new WebSocket(args.url + "?key=" + args.key);
	options.timeUrl = args.timeUrl;
	tc.init(options);
	monitoring.lastOptions = options;
	setWS();
};


/**
 * Defines the Websocket
 * Open, Error, Close and Message behavior
 */
const setWS = () => {
	ws.on("open", () => {
		const msg = "[app]: ⏳ Connected to game server and waiting for a game to start. ";
		console.log(msg.cyan); monitoring.sendMessage(msg);

		monitoring.queue();
		
		rounds = [];
		endedOnError = false;
		eliminated = false;
	});

	ws.on("error", (error) => {
		endedOnError = true;

		const msg = "[app]: ❗ ERROR: " + error;
		console.log(msg.red); monitoring.sendMessage(msg);
	});

	// gibt es am Ende Daten auszulesen?
	ws.on("close", (data) => {
		const msg = "[app]: ✋ CLOSING: " + data;
		console.log(msg.blue); monitoring.sendMessage(msg);
		round = 0;
		if(endedOnError){
			if(monitoring.autostart){
				setTimeout(() => {
					startGame(monitoring.lastOptions);
				}, 3000);
			}
			return;
		}
		if(!isTest){
			db.pushProtokoll(rounds, cells, tc.getActiveName()).then(() => {
				monitoring.sendMessage("[DB]: 💾 Saved!");
			});
		}
		monitoring.sendGameEnd("finaly");
		if(monitoring.autostart){
			setTimeout(() => {
				startGame(monitoring.lastOptions);
			}, 1000);
		}
	});

	ws.on("message", async (rawTextData) => {
		let gameData = JSON.parse(rawTextData);
		round++;
		gameData.round = round;
		roundUpdate(gameData);
		//Player eliminated===============
		if(gameData.players[gameData.you].active == false){
			//ws.send("");
			if(!eliminated){
				monitoring.sendMessage("[app]: ❌ Eliminated");
				monitoring.sendGameEnd("eliminated");
				console.log("[app]: eliminated");
				eliminated = true;
				console.log("[app]: Waiting for game to finish. . . ");
			}
			return;
		}
		//Player active===================
		console.log(" ");
		console.log("[app]: calculating next move");
		//tacticController
		const move = await tc.nextMove(gameData);
		ws.send("{\"action\": \"" + move + "\"}");
		monitoring.sendMove(move);
	});

};

/**
 * Sends the new gameData to monitoring,
 * shrinks the gameData object by the cells array and 
 * adds it to the rounds array
 * @param {object} gameData 
 */
const roundUpdate = (gameData) => {
	//monitoring
	monitoring.update(gameData);

	//database
	let minimized = {
		width: gameData.width,
		height: gameData.height,
		players: gameData.players,
		you: gameData.you,
		running: gameData.running,
		deadline: gameData.deadline
	};
    
	cells = gameData.cells;
	rounds.push(minimized);
};

export {startGame};