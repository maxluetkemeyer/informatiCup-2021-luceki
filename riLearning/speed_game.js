//npm
import * as tf from "@tensorflow/tfjs";
// eslint-disable-next-line no-unused-vars
import * as colors from "colors";
//imports
import WSocket from "./wSocket";
import { getRandomInteger } from "./utils";

// TODO: Tune these parameters.
export const ONE_STEP_REWARD = 1;
export const PLAYER_DIED_REWARD = 10;
export const WIN_REWARD = 50;
export const DEATH_REWARD = -100;
// Actions
export const ACTION_CHANGE_NOTHING = 0;
export const ACTION_TURN_LEFT = 1;
export const ACTION_TURN_RIGHT = 2;
//export const ACTION_SLOW_DOWN = 3;
//export const ACTION_SPEED_UP = 4;

export const ALL_ACTIONS = [
  ACTION_CHANGE_NOTHING,
  ACTION_TURN_LEFT,
  ACTION_TURN_RIGHT,
];
export const NUM_ACTIONS = ALL_ACTIONS.length;

/**
 * Generate a random action among all possible actions.
 *
 * @return {0 | 1 | 2} Action represented as a number.
 */
export function getRandomAction() {
  return getRandomInteger(0, NUM_ACTIONS);
}

/**
 * get action string by action value
 * @param {number} actionValue 
 */
export const getActionFromValue = (actionValue) => {
  switch (actionValue) {
    case 0:
      return "change_nothing";
    case 1:
      return "turn_left";
    case 2:
      return "turn_right";
    case 3:
      return "slow_down";
    case 4:
      return "speed_up";
  }
};

export class SpeedGame {
  /**
   * Constructor of SpeedGame.
   */
  constructor() {
    this.height = 80;
    this.width = 80;
    this.wSocket = new WSocket();
  }

  /**
   * @deprecated
   * Reset the state of the game.
   */
  async reset() {
    console.log("Game Reset");
  }

  /**
   * Perform a step of the game.
   *
   * @param {0 | 1 | 2 } actionNumber The action to take in the current step.
   *   The meaning of the possible values:
   *     export const ACTION_CHANGE_NOTHING = 0;
   *     export const ACTION_TURN_LEFT = 1;
   *     export const ACTION_TURN_RIGHT = 2;
   *     export const ACTION_SLOW_DOWN = 3;
   *     export const ACTION_SPEED_UP = 4;
   * @return {Object} Object with the following keys:
   *   - `reward` {number} the reward value.
   *   - `state` New state of the game after the step.
   *   - `done` {boolean} whether the game has ended after this step.
   */
  async step(actionValue) {
    //Init step
    let done = false;
    let action = getActionFromValue(actionValue);
    
    console.log(("action: " + action).green.bold);

    //execute step and wait for next gameData
    let nextGameData = await this.wSocket.getNextGameData(action);
    if (nextGameData == undefined) {
      nextGameData = this.gameData;
    }
    this.updateGameData(nextGameData);

    //prepare return
    //flattened transformed cells array 
    const state = this.getState();
    //check if game has ended
    //lose?
    if (this.players[this.you].active == false) {
      console.log(("Ausgeschieden!").white.bgMagenta.bold);
      this.wSocket.closed = true;
      done = true;
      return { reward: DEATH_REWARD, state, done };
    }
    //win?
    if (this.players[this.you].active == true) {
      let activePlayers = 0;
      for (let i = 0; i < this.players.length; i++) {
        if (this.players[i].active == true) {
          activePlayers++;
        }
      }
      if (activePlayers == 1) {
        console.log(("Gewonnen!").black.bgWhite.bold);
        this.wSocket.closed = true;
        done = true;
        return { reward: WIN_REWARD, state, done };
      }
    }
    //another player died
    let oldActivePlayers = 0;
    let newActivePlayers = 0;
    for(let i = 0; i < this.players.length; i++){
      if(this.players[i].active == true){
        newActivePlayers++;
      }
    }
    for(let i = 0; i < this.oldGameData.players.length; i++){
      if(this.oldGameData.players[i].active == true){
        newActivePlayers++;
      }
    }
    if(oldActivePlayers != newActivePlayers){
      return { reward: PLAYER_DIED_REWARD, state, done };
    }

    return { reward: ONE_STEP_REWARD, state, done };
  }

  /**
   * @return flattened transformed cells array
   */
  getState() {
    return JSON.parse(JSON.stringify(this.cells.flat()));
  }

  /**
   * updates the current gameData variables
   * @param {Object} gameData
   */
  updateGameData(gameData) {
    if(this.oldGameData == undefined){
      this.oldGameData = gameData;
    }else {
      this.oldGameData = this.newGameData;
    }
    this.newGameData = gameData;

    this.height = gameData.height;
    this.width = gameData.width;
    this.cells = gameData.cells;
    this.players = gameData.players;
    this.you = gameData.you;
    this.running = gameData.running;
    this.gameData = gameData;
    //round, deadline
    this.transformCells(this.cells);
  }

  /**
   * Unify player "colors"
   * @param {Array} array
   */
  transformCells(array) {
    for (let y = 0; y < array.length; y++) {
      for (let x = 0; x < array[y].length; x++) {
        if (array[y][x] != 0) {
          array[y][x] = 1;
        }
      }
    }

    Object.entries(this.players).forEach((item) => {
      let x = item[1].x; // object.entries gibt ein Array ([0] ist Index und [1] ist Value)
      let y = item[1].y;

      array[y][x] = 5;
    });
    let youY = this.players[this.you].y;
    let youX = this.players[this.you].x;

    array[youY][youX] = 10;
  }
}

/**
 * state as tensor
 * TODO: clean up, think out
 * @param {Array} stateParam 
 * @param {number} wasLos 
 * @return {tf.tensor}
 */
export function getStateTensor(stateParam, wasLos) {
  let numExamples;
  if (wasLos == 0) {
    //const state = tf.tensor(stateParam);
    //let state = ten1.reshape([35]);
    //ten1.dispose();
    //console.log(ten2.dataSync());
    let state = [stateParam];
    // if (!Array.isArray(state)) {
    //   state = [state];
    // }
    numExamples = state.length; // = 1
    //console.log("getStateTensor: state");
    //console.log(state);

    const sTen = tf.tensor(state, [numExamples, 6400]);
    // const buffer = tf.buffer([numExamples, 35]);

    // for (let n = 0; n < numExamples; ++n) {
    //   if (state[n] == null) {
    //     continue;
    //   }
    //   // Mark the snake.
    //   state[n].forEach((element, i) => {
    //     buffer.set(i === 0 ? 2 : 1, n, yx[0], yx[1], 0);
    //   });
    // }
    // const cool = buffer.toTensor();
    //console.log("State Tensor:");
    //cool.print();
    return sTen;
    //return buffer.toTensor();
  }
  if (wasLos == 1) {
    let state = stateParam;
    numExamples = state.length;
    const sTen = tf.tensor(state, [numExamples, 6400]);
    return sTen;
  }
}
