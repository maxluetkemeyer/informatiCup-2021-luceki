import {shuffleArray} from "../../utils";
import tactic from "../tactic";
import dontHit from "./dontHit";

export default class dontHitSemiRandom extends tactic {
    /**
     * Constructor of dontHitSemiRandom
     */
    constructor() {
        super("dontHitSemiRandom");
    }

    /**
     * Calculates the next Move randomly.
     */
    async nextMove() {
        // Shuffel order array whether we go take first the left or right
        // prime priority is front per se
        let shuffledLeftRight = shuffleArray([1,2]);
        // Set options for dontHit
        let options = {
            pattern: {
                front: 0,
                right: shuffledLeftRight[0],
                left: shuffledLeftRight[1]
            }
        }; 
        // Create dontHit instance
        let dH = new dontHit(options);
        dH.updateGameData(this.gameData);
        // Get nextMove from dontHit
        return dH.nextMove();
    }
}