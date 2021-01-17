// imports
import tactic from "../tactic";
import * as possible from "./possible";
import {shuffleArray} from "../../utils";

export default class recursiveBnB extends tactic {
    /**
     * recursiveBnB uses a counter and variable to store the chosen move
     * @param {Object} options 
     */
    constructor(options) {
        super("recursiveBnB");
        this.chosenMove;
        this.counter;
        this.depth = options.searchDepth;
        this.useRandom = options.useRandom;
        this.order = options.order;
        console.log("[Tactic]: searchDepth: " + this.depth);
        console.log("[Tactic]: randomOrder: " + this.useRandom);
        if(!this.useRandom){
            console.log("[Tactic]: order: " + this.order);
        }
        // DEBUG
        this.allRecs = 0;
        this.allBounds = 0;
        this.allCalcTime = 0;
    }

    /**
     * async function to get next move
     */
    async nextMove() {
        //Create gameData Object
        let gameData = {
            width: this.width,
            height: this.height,
            cells: this.cells,
            players: this.players,
            you: this.you,
            running: this.running,
            round: this.round
        };
        //Reset
        this.counter = 0;
        // "change_nothing" if something goes wrong
        this.chosenMove = "change_nothing";

        //console.log("field size: x:" + this.width + " y:"+this.height);
        this.boundCounter = 0;
        this.simCounter = 0;
        // call of recursive method
        let tmpTime = new Date();
        let tmpMove =this.calcMoveRec(gameData);
        let tmpEndTime = new Date();
        let timeDiff = tmpEndTime-tmpTime;
        console.log("[recursiveBnB]: recs: " + this.simCounter + ", bounds: " + this.boundCounter + ", calcTime: " + timeDiff + "ms");
        
        this.allRecs = this.allRecs + this.simCounter;
        this.allBounds = this.allBounds + this.boundCounter;
        this.allCalcTime = this.allCalcTime + timeDiff;

        console.log("[recursiveBnB]: AVG recs: " + (this.allRecs/this.round) + ", AVG bounds: " + (this.allBounds/this.round) + ", AVG calcTime: " + (this.allCalcTime/this.round) + "ms");

        return tmpMove;
    }

    /**
     * calculates a move using recursion, depth search and branch and bound
     * @param {Object} d gameData
     */
    calcMoveRec(d) {
        //let order = this.getRandomOrder();
        let order = this.order;
        if(this.useRandom){
            
            order = shuffleArray(["SD", "CN", "TR", "TL", "SU"]);
        }


        // MAKE THIS WORK
        if (!this.inTime()) {
            if (this.chosenMove == undefined) {
                console.log("[tactic]: chosen move undefined");
                return "change_nothing";
            }
            console.log("[tactic]: move: " + this.chosenMove);
            return this.chosenMove;
        }
        // depth search
        // recursion ends when given max depth is reached
        if (this.counter >= this.depth) {
            // chosen move gets returned
            return this.chosenMove;
        }
        for (let i = 0; i < order.length; i++) {
            switch (order[i]) {
                case "CN":
                    if (possible.changeNothing(d, d.you, d.round)) {
                        this.simCounter++;
                        if (this.counter == 0) this.chosenMove = "change_nothing";
                        let simD = this.simulateDecision(d, d.you, "change_nothing");
                        this.counter++;
                        this.calcMoveRec(simD);
                    } else {
                        this.boundCounter++;
                    }
                    break;
                case "SD":
                    // a high priority to slow down cuts the branch and bound tree early when speed already is 1
                    // has the effect that the tactic is working rather carefully than aggressive
                    if (possible.slowDown(d, d.you, d.round)) {
                        this.simCounter++;
                        if (this.counter == 0) this.chosenMove = "slow_down";
                        let simD = this.simulateDecision(d, d.you, "slow_down");
                        this.counter++;
                        this.calcMoveRec(simD);
                    }else {
                        this.boundCounter++;
                    }
                    break;
                case "SU":
                    if (possible.speedUp(d, d.you, d.round)) {
                        this.simCounter++;
                        if (this.counter == 0) this.chosenMove = "speed_up";
                        let simD = this.simulateDecision(d, d.you, "speed_up");
                        this.counter++;
                        this.calcMoveRec(simD);
                    }else {
                        this.boundCounter++;
                    }
                    break;
                case "TL":
                    if (possible.turnLeft(d, d.you, d.round)) {
                        this.simCounter++;
                        if (this.counter == 0) this.chosenMove = "turn_left";
                        let simD = this.simulateDecision(d, d.you, "turn_left");
                        this.counter++;
                        this.calcMoveRec(simD);
                    }else {
                        this.boundCounter++;
                    }
                    break;
                case "TR":
                    if (possible.turnRight(d, d.you, d.round)) {
                        this.simCounter++;
                        if (this.counter == 0) this.chosenMove = "turn_right";
                        let simD = this.simulateDecision(d, d.you, "turn_right");
                        this.counter++;
                        this.calcMoveRec(simD);
                    }else {
                        this.boundCounter++;
                    }
                    break;
            }
            if (this.counter >= this.depth) {
                return this.chosenMove;
            }
        }
        // tried all options at certain depth - reduce counter to go to lower depth
        // console.log("[tactic]: decrease counter from " + this.counter + " to " + (this.counter - 1));
        this.counter--;
        return this.chosenMove;
    }

    /**
     * able to simulate every decision for every player
     * @param {Object} data 
     * @param {number} player 
     * @param {string} decision 
     */
    simulateDecision(data, player, decision) {
        let d = JSON.parse(JSON.stringify(data)); // deep clone
        // current player information
        let direction = d.players[player].direction;
        let currentSpeed = d.players[player].speed;
        let currentRow = d.players[player].y;
        let currentColumn = d.players[player].x;

        //console.log("[DEBUG]: simulating " + decision + " for player " + player+ " at x: " +currentColumn + " y: " + currentRow+ ", direction: " + direction + ", speed:"+ currentSpeed);


        // all possible decisions in all possible directions regarding the current speed
        //TODO: optimize this large switch expression 
        switch (decision) {
            // speed_up
            case "speed_up":
                d.players[player].speed++;
                // regarding the direction create track and change head coordinates
                switch (direction) {
                    case "up":
                        for (let i = 1; i <= currentSpeed + 1; i++) {
                            d.cells[currentRow - i][currentColumn] = player;
                        }
                        d.players[player].y -= currentSpeed + 1;
                        break;
                    case "right":
                        for (let i = 1; i <= currentSpeed + 1; i++) {
                            d.cells[currentRow][currentColumn + i] = player;
                        }
                        d.players[player].x += currentSpeed + 1;
                        break;
                    case "left":
                        for (let i = 1; i <= currentSpeed + 1; i++) {
                            d.cells[currentRow][currentColumn - i] = player;
                        }
                        d.players[player].x -= currentSpeed + 1;
                        break;
                    case "down":
                        for (let i = 1; i <= currentSpeed + 1; i++) {
                            d.cells[currentRow + i][currentColumn] = player;
                        }
                        d.players[player].y += currentSpeed + 1;
                        break;
                }
                break;
                // change_nothing
            case "change_nothing":
                // regarding the direction create track and change head coordinates
                switch (direction) {
                    case "up":
                        for (let i = 1; i <= currentSpeed; i++) {
                            d.cells[currentRow - i][currentColumn] = player;
                        }
                        d.players[player].y -= currentSpeed;
                        break;
                    case "right":
                        for (let i = 1; i <= currentSpeed; i++) {
                            d.cells[currentRow][currentColumn + i] = player;
                        }
                        d.players[player].x += currentSpeed;
                        break;
                    case "left":
                        for (let i = 1; i <= currentSpeed; i++) {
                            d.cells[currentRow][currentColumn - i] = player;
                        }
                        d.players[player].x -= currentSpeed;
                        break;
                    case "down":
                        for (let i = 1; i <= currentSpeed; i++) {
                            d.cells[currentRow + i][currentColumn] = player;
                        }
                        d.players[player].y += currentSpeed;
                        break;
                }
                break;
                // slow_down
            case "slow_down":
                d.players[player].speed--;
                // regarding the direction create track and change head coordinates
                switch (direction) {
                    case "up":
                        for (let i = 1; i <= currentSpeed - 1; i++) {
                            d.cells[currentRow - i][currentColumn] = player;
                        }
                        d.players[player].y -= currentSpeed - 1;
                        break;
                    case "right":
                        for (let i = 1; i <= currentSpeed - 1; i++) {
                            d.cells[currentRow][currentColumn + i] = player;
                        }
                        d.players[player].x += currentSpeed - 1;
                        break;
                    case "left":
                        for (let i = 1; i <= currentSpeed - 1; i++) {
                            d.cells[currentRow][currentColumn - i] = player;
                        }
                        d.players[player].x -= currentSpeed - 1;
                        break;
                    case "down":
                        for (let i = 1; i <= currentSpeed - 1; i++) {
                            d.cells[currentRow + i][currentColumn] = player;
                        }
                        d.players[player].y += currentSpeed - 1;
                        break;
                }
                break;
                // turn_right 
            case "turn_right":
                // regarding the direction create track and change head coordinates, speed and direction
                switch (direction) {
                    case "up":
                        for (let i = 1; i <= currentSpeed; i++) {
                            d.cells[currentRow][currentColumn + i] = player;
                        }
                        d.players[player].x += currentSpeed;
                        d.players[player].direction = "right";
                        break;
                    case "right":
                        for (let i = 1; i <= currentSpeed; i++) {
                            d.cells[currentRow + i][currentColumn] = player;
                        }
                        d.players[player].y += currentSpeed;
                        d.players[player].direction = "down";
                        break;
                    case "left":
                        for (let i = 1; i <= currentSpeed; i++) {
                            d.cells[currentRow - i][currentColumn] = player;
                        }
                        d.players[player].y -= currentSpeed;
                        d.players[player].direction = "up";
                        break;
                    case "down":
                        for (let i = 1; i <= currentSpeed; i++) {
                            d.cells[currentRow][currentColumn - i] = player;
                        }
                        d.players[player].x -= currentSpeed;
                        d.players[player].direction = "left";
                        break;
                }
                break;
                // turn_left
            case "turn_left":
                // regarding the direction create track and change head coordinates, speed and direction
                switch (direction) {
                    case "up":
                        for (let i = 1; i <= currentSpeed; i++) {
                            d.cells[currentRow][currentColumn - i] = player;
                        }
                        d.players[player].x -= currentSpeed;
                        d.players[player].direction = "left";
                        break;
                    case "right":
                        for (let i = 1; i <= currentSpeed; i++) {
                            d.cells[currentRow - i][currentColumn] = player;
                        }
                        d.players[player].y -= currentSpeed;
                        d.players[player].direction = "up";
                        break;
                    case "left":
                        for (let i = 1; i <= currentSpeed; i++) {
                            d.cells[currentRow + i][currentColumn] = player;
                        }
                        d.players[player].y += currentSpeed;
                        d.players[player].direction = "down";
                        break;
                    case "down":
                        for (let i = 1; i <= currentSpeed; i++) {
                            d.cells[currentRow][currentColumn + i] = player;
                        }
                        d.players[player].x += currentSpeed;
                        d.players[player].direction = "right";
                        break;
                }
                break;
        }
        // increment round
        d.round++;
        // return data with simulated decision
        return d;
    }
}