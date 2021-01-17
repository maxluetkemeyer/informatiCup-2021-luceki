//npm
import https from "https";
import url from "url";


export default class tactic {
	/**
     * Contructor of "abstract" class tactic
     * @param {string} name 
     */
	constructor(name) {
		this.name = name;
		this.lastMove = "";
		this.serverTimeDiff = 0;
		this.dataToSend = {};
		this.timeleft = -1;
	}

	/**
     * updates the current gameData variables
     * @param {object} gameData 
     */
	updateGameData(gameData) {
		this.height = gameData.height;
		this.width = gameData.width;
		this.cells = gameData.cells;
		this.players = gameData.players;
		this.you = gameData.you;
		this.running = gameData.running;
		this.deadline = new Date(gameData.deadline).getTime();
		this.round = gameData.round;
		this.gameData = gameData;
	}

	/**
     * called when first gameData arrives
     * can be overridden in child class
     */
	init() {
		console.log("No special init");
	}

	/**
	 * have to be implemented by the child 
	 */
	async nextMove(){
		throw "No next Move implemented!";
	}

	/**
     * If there is more than 1 second left, return true
     * otherwise return false
     * @return {boolean} boolean
     */
	inTime() {
		const now = new Date().getTime();
		this.timeleft = this.deadline - (now + this.serverTimeDiff);
		if (this.timeleft > 1000) {
			return true;
		} else {
			console.error("[TC]: Berechnung dauerte zu lange!");
			return false;
		}
	}

	/**
     * Calculates the time differnce between Client and Server
     */
	setServerTimeDiff(timeUrl) {
		if(timeUrl == undefined || timeUrl == ""){
			return;
		}
		let parsed = url.parse(timeUrl);
		const options = {
			host: parsed.host,
			path: parsed.path,
			timeout: 3000
		};
		let str = "";
		const latencyAdjustment = new Date().getTime();
		https.request(options, (res) => {
			//another chunk of data has been received, so append it to `str`
			res.on("data", (chunk) => {
				str += chunk;
			});

			//the whole response has been received
			res.on("end", () => {
				let serverTime = JSON.parse(str).time;
				this.serverTimeDiff = new Date(serverTime) - new Date().getTime() - (new Date().getTime() - latencyAdjustment);

				//console.log("ServerTimeDiff "+this.serverTimeDiff);
				//console.log("time diff: "+(new Date().getTime()-latencyAdjustment));
			});

			res.on("timeout", () => {
				// eslint-disable-next-line no-undef
				request.abort();
				console.log("Server time could not be set. Timed out");
			});

			res.on("error", () => {
				console.log("Couldn't get time from time server");
			});
		}).end();
	}

	/**
	 * Is the playre alone surounded by walls?
	 * @return {boolean}
	 */
	amIAlone(){
		let image, sr, sc, newColor;
		image = JSON.parse(JSON.stringify(this.cells));
		sr = this.players[this.you].y;
		sc = this.players[this.you].x;
		image[sr][sc] = 0; 
		newColor = 100;

		//Get the input which needs to be replaced.
		const current = 0; 
				
		//If the newColor is same as the existing 
		//Then return the original image.
		// if(current === newColor){
		// 	return image;
		// }

		//Other wise call the fill function which will fill in the existing image.
		let result;
		try{
			result = this.amIAloneFill(image, sr, sc, newColor, current);
		}catch(e){
			console.log("[Tactic] amIAlone Error");
			result = false;
		}
		
		console.log("[Tactic] Alone: "+result);
		//Return the image once it is filled
		return result;
	}
	
	/**
	 * 
	 * @param {*} image 
	 * @param {*} sr 
	 * @param {*} sc 
	 * @param {*} newColor 
	 * @param {*} current 
	 */
	amIAloneFill(image, sr, sc, newColor, current){
		//If row is less than 0
		if(sr < 0){
			return true;
		}
	
		//If column is less than 0
		if(sc < 0){
			return true;
		}
	
		//If row is greater than image length
		if(sr > image.length - 1){
			return true;
		}
	
		//If column is greater than image length
		if(sc > image[sr].length - 1){
			return true;
		}
	
		for (const [key] of Object.entries(this.players)) {
			if(sr == this.players[key].y && sc == this.players[key].x && this.you != key && this.players[key].active == true){
				return false;
			}
		}

		//If the current pixel is not which needs to be replaced
		if(image[sr][sc] !== current){
			return true;
		}
		
		//Update the new color
		image[sr][sc] = newColor; //damit man weiss, wo man schon war
		
		
		//Fill in all four directions
		//Fill Prev row
		const return1 = this.amIAloneFill(image, sr - 1, sc, newColor, current);

		//Fill Next row
		const return2 = this.amIAloneFill(image, sr + 1, sc, newColor, current);

		//Fill Prev col
		const return3 = this.amIAloneFill(image, sr, sc - 1, newColor, current);

		//Fill next col
		const return4 = this.amIAloneFill(image, sr, sc + 1, newColor, current);
	
		if(return1 && return2 && return3 && return4){
			return true;
		}else {
			return false;
		}
	}
}