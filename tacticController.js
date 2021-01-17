//npm
// eslint-disable-next-line no-unused-vars
import * as colors from "colors";

//imports
import {sendTacticData} from "./monitoring/monitoring";
//tactic imports
import exampleTactic from "./tactics/exampleTactic";
import dontHit from "./tactics/dontHit/dontHit";
import dontHitRandom from "./tactics/dontHit/dontHitRandom";
import dontHitSemiRandom from "./tactics/dontHit/dontHitSemiRandom";
import recursiveBnB from "./tactics/recursiveBnB/recursiveBnB";
import dangerFields from "./tactics/dangerFields/dangerFields";
import tfModels from "./tactics/tfModels/tfModels";


export default class tacticController{
	/**
	 * Constructor of tacticController
	 */
	constructor(){
		this.tactic;
		this.alreadyInit = false;
		this.move = "";
	}

	/**
	 * gets nextMove from active tactic
	 * @param {object} gameData 
	 */
	async nextMove(gameData){
		//update gameData
		this.tactic.updateGameData(gameData);
		if(!this.alreadyInit){
			this.tactic.init();
			this.alreadyInit = true;
		}
		//calculate next Move
		const startCalcTime = new Date().getTime();
		this.move = await this.tactic.nextMove();
		
		const calcTime = (new Date().getTime())-startCalcTime;
		const data = {
			dataToSend: this.tactic.dataToSend,
			calcTime
		};
		sendTacticData(data);
		
		this.tactic.lastMove = this.move;
		const tacticMsg = "[TC]: " + this.move;
		console.log(tacticMsg.green.bold);
		return this.move;
	}

	/**
	 * activates the given tactic
	 * @param {object} options 
	 */
	init(options){
		this.alreadyInit = false;
		console.log("[TC]: Using "+options.tactic);
		switch (options.tactic) {
			case "exampleTactic":
				this.tactic = new exampleTactic();
				break;
			case "recursiveBnB":
				this.tactic = new recursiveBnB(options);
				break;
			case "dontHit":
				this.tactic = new dontHit(options);
				break;
			case "dontHitRandom":
				this.tactic = new dontHitRandom();
				break;
			case "dontHitSemiRandom":
				this.tactic = new dontHitSemiRandom();
				break;
			case "dangerFields":
				this.tactic = new dangerFields(options);
				break;
			case "tfModels":
				this.tactic = new tfModels(options);
				break;
			
		}

		this.tactic.setServerTimeDiff(options.time_url);
	}

	/**
	 * Returns the name of the active tactic
	 */
	getActiveName(){
		return this.tactic.name;
	}
}