import * as fs from "fs";
import * as argparse from "argparse";
import {mkdir} from "shelljs";

// The value of tf (TensorFlow.js-Node module) will be set dynamically
// depending on the value of the --gpu flag below.
let tf;

import {SpeedGameAgent} from "./agent";
import {copyWeights} from "./dqn";
import {SpeedGame} from "./speed_game";
import MovingAverager from "./moving_averager";



/**
 * Train an agent to play the snake game.
 *
 * @param {SpeedGameAgent} agent The agent to train.
 * @param {number} batchSize Batch size for training.
 * @param {number} gamma Reward discount rate. Must be a number >= 0 and <= 1.
 * @param {number} learnigRate
 * @param {number} cumulativeRewardThreshold The threshold of moving-averaged
 *   cumulative reward from a single game. The training stops as soon as this
 *   threshold is achieved.
 * @param {number} maxNumFrames Maximum number of frames to train for.
 * @param {number} syncEveryFrames The frequency at which the weights are copied
 *   from the online DQN of the agent to the target DQN, in number of frames.
 * @param {string} savePath Path to which the online DQN of the agent will be
 *   saved upon the completion of the training. 
 * @param {string} logDir Directory to which TensorBoard logs will be written
 *   during the training. Optional.
 */
export const train = async (
    agent, batchSize, gamma, learningRate, cumulativeRewardThreshold,
    maxNumFrames, syncEveryFrames, savePath, logDir) => {
  let summaryWriter;
  if (logDir != null) {
    summaryWriter = tf.node.summaryFileWriter(logDir);
  }


  for (let i = 0; i < agent.replayBufferSize; ++i) {
    console.log("Creating Replay Memory " + i + "/" + agent.replayBufferSize);
    await agent.playStep();
  }
  console.log("Finished Replay Memory");

  // Moving averager: cumulative reward across 100 most recent 100 episodes.
  const rewardAverager100 = new MovingAverager(100);

  const optimizer = tf.train.adam(learningRate);
  let tPrev = new Date().getTime();
  let frameCountPrev = agent.frameCount;
  let averageReward100Best = -Infinity;
  

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // console.log("5 "+myTest5); myTest5++;
    agent.trainOnReplayBatch(batchSize, gamma, optimizer);
    const {cumulativeReward, done} = await agent.playStep();
    //console.log("reward: "+cumulativeReward);
    if (done) {
      const t = new Date().getTime();
      const framesPerSecond =
          (agent.frameCount - frameCountPrev) / (t - tPrev) * 1e3;
      tPrev = t;
      frameCountPrev = agent.frameCount;
      rewardAverager100.append(cumulativeReward);
      const averageReward100 = rewardAverager100.average();

      console.log(
          `Frame #${agent.frameCount}: ` +
          `cumulativeReward100=${averageReward100.toFixed(1)}; ` +
          `(epsilon=${agent.epsilon.toFixed(3)}) ` +
          `(${framesPerSecond.toFixed(1)} frames/s)`);
      if (summaryWriter != null) {
        summaryWriter.scalar(
            "cumulativeReward100", averageReward100, agent.frameCount);

        summaryWriter.scalar("epsilon", agent.epsilon, agent.frameCount);
        summaryWriter.scalar(
            "framesPerSecond", framesPerSecond, agent.frameCount);
      }
      if (averageReward100 >= cumulativeRewardThreshold ||
          agent.frameCount >= maxNumFrames) {
        // TODO(cais): Save online network.
        break;
      }
      if (averageReward100 > averageReward100Best) {
        averageReward100Best = averageReward100;
        if (savePath != null) {
          if (!fs.existsSync(savePath)) {
            mkdir("-p", savePath);
          }
          await agent.onlineNetwork.save(`file://${savePath}`);
          console.log(`Saved DQN to ${savePath} ##############
          `);
        }
      }
    }
    if (agent.frameCount % syncEveryFrames === 0) {
      copyWeights(agent.targetNetwork, agent.onlineNetwork);
      console.log("Sync'ed weights from online network to target network");
    }
  }
};

/**
 * Argument Parser
 */
export function parseArguments() {
  const parser = new argparse.ArgumentParser({
    description: "Training script for a DQN that plays the snake game"
  });
  parser.add_argument("--gpu", {
    action: "store_true",
    help: "Whether to use tfjs-node-gpu for training " +
    "(requires CUDA GPU, drivers, and libraries)."
  });
  parser.add_argument("--height", {
    type: "int",
    default: 9,
    help: "Height of the game board."
  });
  parser.add_argument("--width", {
    type: "int",
    default: 9,
    help: "Width of the game board."
  });
  parser.add_argument("--cumulativeRewardThreshold", {
    type: "float",
    default: 100,
    help: "Threshold for cumulative reward (its moving " +
    "average) over the 100 latest games. Training stops as soon as this " +
    "threshold is reached (or when --maxNumFrames is reached)."
  });
  parser.add_argument("--maxNumFrames", {
    type: "float",
    default: 1e6,
    help: "Maximum number of frames to run durnig the training. " +
    "Training ends immediately when this frame count is reached."
  });
  parser.add_argument("--replayBufferSize", {
    type: "int",
    default: 1000,
    help: "Length of the replay memory buffer."
  });
  parser.add_argument("--epsilonInit", {
    type: "float",
    default: 1,
    help: "Initial value of epsilon, used for the epsilon-greedy algorithm."
  });
  parser.add_argument("--epsilonFinal", {
    type: "float",
    default: 0.01,
    help: "Final value of epsilon, used for the epsilon-greedy algorithm."
  });
  parser.add_argument("--epsilonDecayFrames", {
    type: "int",
    default: 1e5,
    help: "Number of frames of game over which the value of epsilon " +
    "decays from epsilonInit to epsilonFinal"
  });
  parser.add_argument("--batchSize", {
    type: "int",
    default: 64,
    help: "Batch size for DQN training."
  });
  parser.add_argument("--gamma", {
    type: "float",
    default: 0.99,
    help: "Reward discount rate."
  });
  parser.add_argument("--learningRate", {
    type: "float",
    default: 1e-3,
    help: "Learning rate for DQN training."
  });
  parser.add_argument("--syncEveryFrames", {
    type: "int",
    default: 1e3,
    help: "Frequency at which weights are sync'ed from the online network " +
    "to the target network."
  });
  parser.add_argument("--savePath", {
    type: "str",
    default: "./riLearning/models/"+new Date().getTime(),
    help: "File path to which the online DQN will be saved after training."
  });
  parser.add_argument("--logDir", {
    type: "str",
    default: "./riLearning/logDir",
    help: "Path to the directory for writing TensorBoard logs in."
  });
  return parser.parseArgs();
}

/**
 * Main start function
 */
async function main() {
  const args = parseArguments();
  tf = require("@tensorflow/tfjs-node");

  console.log(`args: ${JSON.stringify(args, null, 2)}`);

  const game = new SpeedGame({
    height: args.height,
    width: args.width
  });
  const agent = new SpeedGameAgent(game, {
    replayBufferSize: args.replayBufferSize,
    epsilonInit: args.epsilonInit,
    epsilonFinal: args.epsilonFinal,
    epsilonDecayFrames: args.epsilonDecayFrames,
    learningRate: args.learningRate
  });
  

  await train(
        agent, args.batchSize, args.gamma, args.learningRate,
        args.cumulativeRewardThreshold, args.maxNumFrames,
        args.syncEveryFrames, args.savePath, args.logDir);
}

if (require.main === module) {
  console.log("1");
  main();
}
