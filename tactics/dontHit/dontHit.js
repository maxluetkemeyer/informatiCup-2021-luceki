import tactic from "../tactic";
import * as clear from "./clear";

export default class dontHit extends tactic{
    /**
     * Constructor for dontHit
     * @param {Object} options 
     */
    constructor(options) {
        super("dontHit");
        
        this.patternFront = options.pattern.front;
        this.patternRight = options.pattern.right;
        this.patternLeft = options.pattern.left;
        this.counter = 0;
    }

    /**
     * Calculates the next Move.
     */
    async nextMove(){
        //DEBUG
        console.log("[tactic]: -- current information --");
        console.log("[tactic]: speed: " + this.players[this.you].speed);
        console.log("[tactic]: position: row: " + this.players[this.you].y + ", column: " + this.players[this.you].x);
        console.log("[tactic]: direction: " + this.players[this.you].direction);

        for(let i=0;i<3;i++) {
            if (i == this.patternFront && clear.front(this.gameData)) {
                // wenn front frei
                return "change_nothing";
            }
    
            if(i == this.patternRight && clear.right(this.gameData)){
                // wenn rechts frei
                return "turn_right";
            }
    
            if (i == this.patternLeft && clear.left(this.gameData)) {
                // wenn rechts frei
                return "turn_left";
            }
        }
        // Kein Ausweg
        return this.speedUp();
    }
    /**
     * speedUp ueberschreitet die maximalgeschwindigkeit nie
     */
    speedUp(){
        if (this.players[this.you].speed<10) {
            console.log("[tactic]: Dying");
            return"speed_up";
        } else {
            console.log("[tactic]: could not increase speed");
            return"change_nothing";
        }
    }
}