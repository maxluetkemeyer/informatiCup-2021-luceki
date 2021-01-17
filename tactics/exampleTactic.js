import tactic from "./tactic.js";

export default class exampleTactic extends tactic{
    /**
     * Constructor for exampleTactic
     */
    constructor() {
		super("exampleTactic");
	}
	/*
    async nextMove(){
        return "change_nothing";
    }*/
    /**
     * 
     */
	async nextMove(){
        return await this.delayed(1);
	}

    /**
     * Waits a certain time before it returns "change_nothing".
     * @param {number} maxSeconds 
     */
	async delayed(maxSeconds){
		let randomTime = Math.random()*maxSeconds*1000;
		console.log("Wait " + randomTime + "ms");
		await new Promise(resolve => setTimeout(resolve, randomTime));
		return "change_nothing";
    }
}

