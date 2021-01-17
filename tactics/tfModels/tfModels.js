/* eslint-disable require-jsdoc */
//npm
import * as colors from "colors";
let tf;
try{
    tf =  require("@tensorflow/tfjs-node");
}catch(e){
    console.error("Couldn't load tfjs-node - tfModels won't work".red.bold);
    console.error("tfjs-node does not properly on Win/ OSX. Only used for tfModels tactic. Consider using Ubuntu for best experience.".blue.bold);
    tf =  require("@tensorflow/tfjs"); //tf.loadLayerModel from file wont work
}

//imports
import tactic from "../tactic";
//riLearning
import {ALL_ACTIONS, getStateTensor, getActionFromValue} from "../../riLearning/speed_game";

export default class tfModels extends tactic{
    constructor(options){
        super("tfModels");

        this.LOCAL_MODEL_URL = "file://./riLearning/models/" + options.model + "/model.json";
        /**
         * @type {tf.Sequential}
         */
        this.qnet;
        this.bestAction;   
    }

    async nextMove(){
        if(this.qNet == undefined){
            console.log("Qnet undefined");
            await this.initQNet();
        }
        this.transformCells(this.cells);
        this.cells = this.sliceCells(this.cells);

        await this.calcQValues();

        console.log("bestAction "+this.bestAction);
        return this.bestAction;
    }

    async initQNet(){
        try {
            this.qNet = await tf.loadLayersModel(this.LOCAL_MODEL_URL);
            console.log(`Loaded model from ${this.LOCAL_MODEL_URL}`);
        } catch (err) {
            console.log('Loading local model failed.');
        }
    }

    async calcQValues(){
        const state = this.cells.flat();
        tf.tidy(() => {
            const stateTensor = getStateTensor(state, 0);
            let actionValue = ALL_ACTIONS[this.qNet.predict(stateTensor).argMax(-1).dataSync()[0]];
            this.bestAction = getActionFromValue(actionValue);
        });
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
            let x = item[1].x;
            let y = item[1].y;

            array[y][x] = 5;
        });
        let youY = this.players[this.you].y;
        let youX = this.players[this.you].x;

        array[youY][youX] = 10;
    }

    /**
     * slices the array to an 80x80 2d array
     */
    sliceCells(array) {
        let sliced = new Array(80);
        //set 1
        for(let y = 0; y < sliced.length; y++){
            sliced[y] = new Array(80);
            for(let x = 0; x < sliced[y].length; x++){
                sliced[y][x] = 1;
                
            }
        }
        //copy values
        for(let y = 0; y < array.length; y++){
            for(let x = 0; x < array[y].length; x++){
                sliced[y][x] = array[y][x];
            }
        }
        return sliced;
    }
}