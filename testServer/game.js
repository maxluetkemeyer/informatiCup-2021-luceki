//imports
import {shuffleArray} from "../utils";
import * as possible from "../tactics/recursiveBnB/possible";
import Player from "./player";
import GameData from "./gameData";
import GameDataArray from "./gameDataArray";

//class to create and manage a game
export default class Game {
    /**
     * creates a game instance
     */
    constructor() {
        //set size of cells
        //this.width = 20 + Math.floor(Math.random() * 81);
        //this.height = 20 + Math.floor(Math.random() * 81);
        this.width = 80;
        this.height = 80;
        //console.log("[game constructor]: new instance of game created with width: " + this.width + ", height: " + this.height);
        //create players
        //console.log("[game constructor]: creating players...");
        this.players = this.createPlayers(this.height, this.width);
        //console.log("[game constructor]: ...created players");
        //console.log("[game constructor]: log of players below:");
        //console.log(this.players);
        //craete cells (also spawns players)
        //console.log("[game constructor]: creating cells...");
        this.cells = this.createCells(this.height, this.width, this.players);
        //console.log("[game constructor]: ...created cells");
        //console.log("[game constructor]: log of cells below:");
        //this.logTableau(this.cells);
    }

    /**
     * creates some players with unqiue random positions
     * @param {number} yMax maximum legal height to spawn
     * @param {number} xMax maximum legal width to spawn
     */
    createPlayers(yMax, xMax) {
        var players = [];
        //simplified: 6 instead of 2-6
        //let n = 2 + Math.floor(Math.random() * 5);
        let n = 6;
        //random unique positions
        let positions = this.getNUniqueRandomPositions(n, xMax, yMax);
        //directions
        let directions = this.getNRandomDirections(n);
        //create players
        for (let i = 0; i < n; i++) {
            players[i] = new Player(positions[i], directions[i]);
        }
        return (players)
    }

    /**
     * executes moves and manipulates gameData,
     * moves that are illigal are not executed
     * @param {Array} moves given moves to execute
     * @param {Object} d gameData to manipulate
     * @param {number} round round to jump when necessary 
     */
    executeMoves(moves, d, round) {
        //console.log("[executeMoves]: executing moves...");
        for (let i = 0; i < moves.length; i++) {
            //console.log("try execute " + moves[i] + " for player " + (i+1));
            if (this.players[i].active) {
                //console.log("player " + (i+1) + " is active :)");
                switch (moves[i]) {
                    case "change_nothing":
                        if (possible.changeNothing(d, i, round)) {
                            this.executeMove(i, moves[i]);
                        } else {
                            this.players[i].active = false;
                        }
                        break;
                    case "speed_up":
                        if (possible.speedUp(d, i, round)) {
                            this.executeMove(i, moves[i]);
                        } else {
                            this.players[i].active = false;
                        }
                        break;
                    case "turn_right":
                        if (possible.turnRight(d, i, round)) {
                            this.executeMove(i, moves[i]);
                        } else {
                            this.players[i].active = false;
                        }
                        break;
                    case "turn_left":
                        if (possible.turnLeft(d, i, round)) {
                            this.executeMove(i, moves[i]);
                        } else {
                            this.players[i].active = false;
                        }
                        break;
                    case "slow_down":
                        if (possible.slowDown(d, i, round)) {
                            this.executeMove(i, moves[i]);
                        } else {
                            this.players[i].active = false;
                        }
                        break;
                }
            }
        }
        //console.log("[executeMoves]: ...moves executed");
        //console.log("[executeMoves]: resulting cells below:");
        //this.logTableau(this.cells);
    }

    /**
     * executes a single move
     * @param {number} player 
     * @param {string} decision 
     */
    executeMove(player, decision) {
        // current player information
        let direction = this.players[player].direction;
        let currentSpeed = this.players[player].speed;
        let currentRow = this.players[player].y;
        let currentColumn = this.players[player].x;

        // all possible decisions in all possible directions regarding the current speed
        //TODO: optimize this large switch expression 
        switch (decision) {
            // speed_up
            case "speed_up":
                this.players[player].speed++;
                // regarding the direction create track and change head coordinates
                switch (direction) {
                    case "up":
                        for (let i = 1; i <= currentSpeed + 1; i++) {
                            this.cells[currentRow - i][currentColumn] = player+1;
                        }
                        this.players[player].y -= currentSpeed + 1;
                        break;
                    case "right":
                        for (let i = 1; i <= currentSpeed + 1; i++) {
                            this.cells[currentRow][currentColumn + i] = player+1;
                        }
                        this.players[player].x += currentSpeed + 1;
                        break;
                    case "left":
                        for (let i = 1; i <= currentSpeed + 1; i++) {
                            this.cells[currentRow][currentColumn - i] = player+1;
                        }
                        this.players[player].x -= currentSpeed + 1;
                        break;
                    case "down":
                        for (let i = 1; i <= currentSpeed + 1; i++) {
                            this.cells[currentRow + i][currentColumn] = player+1;
                        }
                        this.players[player].y += currentSpeed + 1;
                        break;
                }
                break;
                // change_nothing
            case "change_nothing":
                // regarding the direction create track and change head coordinates
                switch (direction) {
                    case "up":
                        for (let i = 1; i <= currentSpeed; i++) {
                            this.cells[currentRow - i][currentColumn] = player+1;
                        }
                        this.players[player].y -= currentSpeed;
                        break;
                    case "right":
                        for (let i = 1; i <= currentSpeed; i++) {
                            this.cells[currentRow][currentColumn + i] = player+1;
                        }
                        this.players[player].x += currentSpeed;
                        break;
                    case "left":
                        for (let i = 1; i <= currentSpeed; i++) {
                            this.cells[currentRow][currentColumn - i] = player+1;
                        }
                        this.players[player].x -= currentSpeed;
                        break;
                    case "down":
                        for (let i = 1; i <= currentSpeed; i++) {
                            this.cells[currentRow + i][currentColumn] = player+1;
                        }
                        this.players[player].y += currentSpeed;
                        break;
                }
                break;
                // slow_down
            case "slow_down":
                this.players[player].speed--;
                // regarding the direction create track and change head coordinates
                switch (direction) {
                    case "up":
                        for (let i = 1; i <= currentSpeed - 1; i++) {
                            this.cells[currentRow - i][currentColumn] = player+1;
                        }
                        this.players[player].y -= currentSpeed - 1;
                        break;
                    case "right":
                        for (let i = 1; i <= currentSpeed - 1; i++) {
                            this.cells[currentRow][currentColumn + i] = player+1;
                        }
                        this.players[player].x += currentSpeed - 1;
                        break;
                    case "left":
                        for (let i = 1; i <= currentSpeed - 1; i++) {
                            this.cells[currentRow][currentColumn - i] = player+1;
                        }
                        this.players[player].x -= currentSpeed - 1;
                        break;
                    case "down":
                        for (let i = 1; i <= currentSpeed - 1; i++) {
                            this.cells[currentRow + i][currentColumn] = player+1;
                        }
                        this.players[player].y += currentSpeed - 1;
                        break;
                }
                break;
                // turn_right 
            case "turn_right":
                // regarding the direction create track and change head coordinates, speed and direction
                switch (direction) {
                    case "up":
                        for (let i = 1; i <= currentSpeed; i++) {
                            this.cells[currentRow][currentColumn + i] = player+1;
                        }
                        this.players[player].x += currentSpeed;
                        this.players[player].direction = "right";
                        break;
                    case "right":
                        for (let i = 1; i <= currentSpeed; i++) {
                            this.cells[currentRow + i][currentColumn] = player+1;
                        }
                        this.players[player].y += currentSpeed;
                        this.players[player].direction = "down";
                        break;
                    case "left":
                        for (let i = 1; i <= currentSpeed; i++) {
                            this.cells[currentRow - i][currentColumn] = player+1;
                        }
                        this.players[player].y -= currentSpeed;
                        this.players[player].direction = "up";
                        break;
                    case "down":
                        for (let i = 1; i <= currentSpeed; i++) {
                            this.cells[currentRow][currentColumn - i] = player+1;
                        }
                        this.players[player].x -= currentSpeed;
                        this.players[player].direction = "left";
                        break;
                }
                break;
                // turn_left
            case "turn_left":
                // regarding the direction create track and change head coordinates, speed and direction
                switch (direction) {
                    case "up":
                        for (let i = 1; i <= currentSpeed; i++) {
                            this.cells[currentRow][currentColumn - i] = player+1;
                        }
                        this.players[player].x -= currentSpeed;
                        this.players[player].direction = "left";
                        break;
                    case "right":
                        for (let i = 1; i <= currentSpeed; i++) {
                            this.cells[currentRow - i][currentColumn] = player+1;
                        }
                        this.players[player].y -= currentSpeed;
                        this.players[player].direction = "up";
                        break;
                    case "left":
                        for (let i = 1; i <= currentSpeed; i++) {
                            this.cells[currentRow + i][currentColumn] = player+1;
                        }
                        this.players[player].y += currentSpeed;
                        this.players[player].direction = "down";
                        break;
                    case "down":
                        for (let i = 1; i <= currentSpeed; i++) {
                            this.cells[currentRow][currentColumn + i] = player+1;
                        }
                        this.players[player].x += currentSpeed;
                        this.players[player].direction = "right";
                        break;
                }
                break;
        }
    }

    /**
     * creates first gameData with certain settings
     * @returns {Array} playerData array
     */
    createGameData() {
        let playerData = [];
        let deadline = new Date(new Date().getTime() + (12000));
        for (let i = 0; i < this.players.length; i++) {
            playerData[i] = new GameData(this.cells, this.players, i+1, deadline);
        }
        return playerData;
    }

    /**
     * special case: creates gameData object with player array
     * instead of palyers object
     * creates first gameData with certain settings
     * @returns {Array} playerData array
     */
    createGameDataArray() {
        let playerData = [];
        let deadline = new Date(new Date().getTime() + (12000));
        for (let i = 0; i < this.players.length; i++) {
            playerData[i] = new GameDataArray(this.cells, this.players, i+1, deadline);
        }
        return playerData;
    }

    /**
     * creates 2D cells array,
     * fills array with 0,
     * spawns player in array
     * @param {number} h height of cells
     * @param {number} w width of cells
     * @param {Array} p player to spawn in 2D array
     */
    createCells(h, w, p) {
        let cells = new Array(h);
        for (let y = 0; y < h; y++) {
            cells[y] = new Array(w);
            for (let x = 0; x < w; x++) {
                cells[y][x] = 0;
            }
        }
        for (let i = 0; i < p.length; i++) {
            //console.log("Player " + (i+1) + ": x=" + p[i].x+ ", y="+p[i].y );
            cells[p[i].y][p[i].x] = i+1;
        }
        return (cells);
    }

    /**
     * returns n random directions (to randomly spawn players)
     * @param {number} n number of random directions to return
     */
    getNRandomDirections(n) {
        //given avaliable directions
        let availableDirections = ["up", "down", "left", "right"]
        //init array to return
        let chosenDirections = []
        //add n random directions
        for (let i = 0; i < n; i++) {
            chosenDirections.push(availableDirections[Math.floor(Math.random() * 4)]);
        }
        return (chosenDirections);
    }

    /**
     * returns n random and unique positions to spawn players
     * @param {number} n number of random positions to return
     * @param {number} xMax maximum legal width to spawn
     * @param {number} yMax maximum legal height to spawn
     */
    getNUniqueRandomPositions(n, xMax, yMax) {
        //craete possible position arrays
        var tmpX = [];
        var tmpY = [];
        //fill possible position arrays
        for (let i = 0; i < xMax; i++) {
            tmpX.push(i);
        }
        for (let i = 0; i < yMax; i++) {
            tmpY.push(i);
        }
        //shuffle them
        tmpX = shuffleArray(tmpX);
        tmpY = shuffleArray(tmpY);
        //return first n positions of shuffled arrays
        let uniques = [];
        for (let i = 0; i < n; i++) {
            uniques.push([tmpX[i], tmpY[i]]);
        }
        return (uniques);
    }

    /**
     * logs a tableau (cells array) absolutely beautiful in console,
     * used to debug
     * @param {Array} tableau cells array to log
     */
    logTableau(tableau) {
        console.log("");
        let row = ["[tableau]:"];
        for (let i = 0; i < tableau.length; i++) {
            row[i + 1] = "";
            for (let j = 0; j < tableau[0].length; j++) {
                // sentinel werden als ∞ dargestellt
                if (tableau[i][j] == 0) {
                    row[i + 1] = row[i + 1] + "_";
                } else {
                    row[i + 1] = row[i + 1] + tableau[i][j].toString();
                }
            }
            row[i + 1] = row[i + 1] + " [" + i + ". row]";
        }
        for (let i = 0; i < row.length; i++) {
            console.log(row[i]);
        }
    }
}

// FORMER DEBUG
// let g, myMoves, tmpData;
// g = new Game();
// myMoves = ["change_nothing", "speed_up", "turn_right", "turn_left", "slow_down"];
// myMoves = shuffleArray(myMoves);
// console.log("[debug]: comming moves below:");
// console.log(myMoves);
// tmpData = g.createGameDataArray();
// console.log("------------------------------------------");
// console.log(tmpData[0]);
// console.log(tmpData[0].players[0]);
// console.log("------------------------------------------");
// g.executeMoves(myMoves, tmpData[0], 1);