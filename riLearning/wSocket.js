import WebSocketAwait from "ws-await";
import * as colors from "colors";


export default class WSocket{
    /**
     * Constructor of WSocket
     */
    constructor(){
        /**
         * @type {WebSocketAwait}
         */
        this.wsClient;
        this.closed = true;
        this.initializing = false;
    }

    /**
     * initializes a new WebSocketAwait
     * @param {SpeedGame} myGame 
     */
    init(myGame){
        this.initializing = true;
        this.wsClient = new WebSocketAwait("ws://localhost:3333", {
            awaitTimeout: 2147483646,
            leaveAwaitId: true,
            generateAwaitId: () => 4,
            attachAwaitId: (data, id) => data,
            extractAwaitId: data => 4,
            deleteAwaitId: data => data,
        }); 
        
        this.wsClient.on("open", async () => {
            this.closed = false;
            this.initializing = false;
            let gameData = await this.wsClient.sendAwait({ //Set first gameData
                action: "change_nothing" //we need first gameData
            });
            await myGame.updateGameData(gameData);
        });
        this.wsClient.on("error", (e) => {
            console.log("Websocket Error".red.bold);
            console.error(e);
            this.initializing = false;
            this.closed = true;
        });
        this.wsClient.on("close", (data) => {
            console.log("Websocket Closed " + data);
            this.closed = true;
            this.initializing = false;
        });
    }

    /**
     * executes the new action and waits for the new gameData.
     * @param {string} action 
     */
    async getNextGameData(action){
        let gameData;
        try {
            gameData = await this.wsClient.sendAwait({
                action
            });
        }catch(e){
            console.log("Next gameData Error".red.bold);
            console.log(e);
        }
        
        return gameData;
    }
}