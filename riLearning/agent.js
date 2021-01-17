import * as tf from "@tensorflow/tfjs";

import {createDeepQNetwork} from "./dqn";
import {getRandomAction, NUM_ACTIONS, ALL_ACTIONS, getStateTensor} from "./speed_game";
import {ReplayMemory} from "./replay_memory";
import { assertPositiveInteger } from "./utils";

export class SpeedGameAgent {
  /**
   * Constructor of SnakeGameAgent.
   *
   * @param {SpeedGame} game A game object.
   * @param {object} config The configuration object with the following keys:
   *   - `replayBufferSize` {number} Size of the replay memory. Must be a
   *     positive integer.
   *   - `epsilonInit` {number} Initial value of epsilon (for the epsilon-
   *     greedy algorithm). Must be >= 0 and <= 1.
   *   - `epsilonFinal` {number} The final value of epsilon. Must be >= 0 and
   *     <= 1.
   *   - `epsilonDecayFrames` {number} The # of frames over which the value of
   *     `epsilon` decreases from `episloInit` to `epsilonFinal`, via a linear
   *     schedule.
   *   - `learningRate` {number} The learning rate to use during training.
   */ 
  constructor(game, config) {
    assertPositiveInteger(config.epsilonDecayFrames);

    this.game = game; // game calls reset();
    this.cumulativeReward_ = 0;

    this.epsilonInit = config.epsilonInit;
    this.epsilonFinal = config.epsilonFinal;
    this.epsilonDecayFrames = config.epsilonDecayFrames;
    this.epsilonIncrement_ = (this.epsilonFinal - this.epsilonInit) /
        this.epsilonDecayFrames;

    this.onlineNetwork =
        createDeepQNetwork(NUM_ACTIONS);
    this.targetNetwork =
        createDeepQNetwork(NUM_ACTIONS);
    // Freeze taget network: it's weights are updated only through copying from
    // the online network.
    this.targetNetwork.trainable = false;

    this.optimizer = tf.train.adam(config.learningRate);

    this.replayBufferSize = config.replayBufferSize;
    this.replayMemory = new ReplayMemory(config.replayBufferSize);
    this.frameCount = 0;
    //this.reset();
  }

  /**
   * Reset
   */
  async reset() {
    this.cumulativeReward_ = 0;
    //await this.game.reset();
  }

  /**
   * Play one step of the game.
   *
   * @returns {number | null} If this step leads to the end of the game,
   *   the total reward from the game as a plain number. Else, `null`.
   */
  async playStep() {
      while(this.game.wSocket.closed){
        console.log("waiting. . .");
        await new Promise(resolve => setTimeout(resolve, 2000));
        if(!this.game.wSocket.initializing){
            this.game.wSocket.init(this.game);
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }



    this.epsilon = this.frameCount >= this.epsilonDecayFrames ?
        this.epsilonFinal :
        this.epsilonInit + this.epsilonIncrement_  * this.frameCount;
    this.frameCount++;

    // The epsilon-greedy algorithm.
    let action;
    const state = this.game.getState();
    //console.table(state);
    if (Math.random() < this.epsilon) {
      // Pick an action at random.
      action = getRandomAction(); //exploration
    } else { //exploitation
      // Greedily pick an action based on online DQN output.
      tf.tidy(() => {
        const stateTensor = getStateTensor(state, 0);
        action = ALL_ACTIONS[
          this.onlineNetwork.predict(stateTensor).argMax(-1).dataSync()[0]];
      });
    }

    //const smth = await this.game.doAction(action);
    const {state: nextState, reward, done} = await this.game.step(action);
    //console.log("nextState: "+nextState);
    this.replayMemory.append([state, action, reward, done, nextState]);

    this.cumulativeReward_ += reward;
    const output = {
      action,
      cumulativeReward: this.cumulativeReward_,
      done
    };
    if (done) {
      await this.reset();
    }
    return output;
  }

  /**
   * Perform training on a randomly sampled batch from the replay buffer.
   *
   * @param {number} batchSize Batch size.
   * @param {number} gamma Reward discount rate. Must be >= 0 and <= 1.
   * @param {tf.train.Optimizer} optimizer The optimizer object used to update
   *   the weights of the online network.
   */
  trainOnReplayBatch(batchSize, gamma, optimizer) {
    // Get a batch of examples from the replay buffer.
    const batch = this.replayMemory.sample(batchSize);
    /**
     * loss function for the optimizer
     */
    const lossFunction = () => tf.tidy(() => {
      const stateTensor = getStateTensor(
          batch.map(example => example[0]), 1);
      const actionTensor = tf.tensor1d(
          batch.map(example => example[1]), "int32");
      const qs = this.onlineNetwork.apply(stateTensor, {training: true})
          .mul(tf.oneHot(actionTensor, NUM_ACTIONS)).sum(-1);
      const rewardTensor = tf.tensor1d(batch.map(example => example[2]));
      const nextStateTensor = getStateTensor(
          batch.map(example => example[4]), 1);
      const nextMaxQTensor =
          this.targetNetwork.predict(nextStateTensor).max(-1);
      const doneMask = tf.scalar(1).sub(
          tf.tensor1d(batch.map(example => example[3])).asType("float32"));
      const targetQs =
          rewardTensor.add(nextMaxQTensor.mul(doneMask).mul(gamma));
      return tf.losses.meanSquaredError(targetQs, qs);
    });
    // Calculate the gradients of the loss function with repsect to the weights
    // of the online DQN.
    const grads = tf.variableGrads(lossFunction);
    // Use the gradients to update the online DQN's weights.
    optimizer.applyGradients(grads.grads);
    
    tf.dispose(grads);
    // TODO(cais): Return the loss value here?
  }
}
