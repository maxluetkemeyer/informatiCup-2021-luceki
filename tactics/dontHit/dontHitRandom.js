import {shuffleArray} from "../../utils";
import tactic from "../tactic";
import dontHit from "./dontHit";

export default class dontHitRandom extends tactic {
    /**
     * Constructor of dontHitRandom
     */
    constructor() {
        super("dontHitRandom");
    }

    /**
     * Calculates the next Move randomly.
     */
    async nextMove() {
        // Shuffel order array
        let shuffeld = shuffleArray([0,1,2]);
        // Set options for dontHit
        let options = {
            pattern: {
                front: shuffeld[0],
                right: shuffeld[1],
                left: shuffeld[2]
            }
        }; 
        // Create dontHit instance
        let dH = new dontHit(options);
        dH.updateGameData(this.gameData);
        // Get nextMove from dontHit
        return dH.nextMove();
    }
}