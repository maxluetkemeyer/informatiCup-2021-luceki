import tactic from "../tactic.js";
import { astar, Graph } from "./astar";
import recursiveBnB from "../recursiveBnB/recursiveBnB";

export default class dangerFields extends tactic{
    /**
     * Constructor of tactic dangerFields
     * @param {Object} options 
     */
    constructor(options) {
        super("Danger Fields");
        this.useAlternative = options.useAlternative;
        this.heatMap = [];
        this.closest = options.closest;
        if(this.useAlternative){
            console.log("[Tactic]: Use alternative tactic if alone");
        }
    }

    /**
     * Transforms a cells array
     * 0 -> 1
     * else 0
     * @param {Array} array cells
     */
    transform(array){
        for(let y = 0; y < array.length; y++){
            for(let x = 0; x < array[y].length; x++){
                if(array[y][x] == 0){
                    array[y][x] = 1;
                }else {
                    array[y][x] = 0;
                }
            }
        }
    }

    /**
     * 0 -> Range 5 mark Cirles from outter to innner
     * improvement: update only new fields
     * @param {Array} array 2d
     */
    heat(array, radius){
        //Player lines
        for(let y = 0; y < array.length; y++){
            for(let x = 0; x < array[y].length; x++){
                if(array[y][x] == 0){
                    for(let i = radius; i > 0; i--){
                        this.markCircles(array, y, x, i, 0.5);
                    }
                }
            }
        }

        //Walls Heatmap
        // left, right
        for(let y = 0; y < this.height; y++){
            for(let i = radius; i > 0; i--){
                this.markCircles(array, y, 0, i, 0.5);
            }
            for(let i = radius; i > 0; i--){
                this.markCircles(array, y, this.width-1, i, 0.5);
            }
        }
        // top, bottom
        for(let x = 0; x < this.width; x++){
            for(let i = radius; i > 0; i--){
                this.markCircles(array, 0, x, i, 0.5);
            }
            for(let i = radius; i > 0; i--){
                this.markCircles(array, this.height-1, x, i, 0.5);
            }
        }
    }

    /**
     * Marks a circle on the heatMap
     * @param {Array} array where to mark
     * @param {number} cy 
     * @param {number} cx 
     * @param {number} radius circle radius
     * @param {number} value value to add
     */
    markCircles(array, cy, cx, radius, value){
        let x, y, bx, by, bxe, bye, dx, dy, rps;
        bx = this.clamp(cx - radius, 0, this.width);
        by = this.clamp(cy - radius, 0, this.height);
        bxe = this.clamp(cx + radius + 1, 0, this.width);
        bye = this.clamp(cy + radius + 1, 0, this.height);
        
        rps = (radius + 0.5) * (radius + 0.5);
        for (x = bx; x < bxe; x++) {
            for (y = by; y < bye; y++) {
                dx = cx - x;
                dy = cy - y;
                if (dx * dx + dy * dy < rps) {
                    //fillCell(x, y);
                    if(array[y][x] != 0){
                        array[y][x] += value;
                    }
                }
            }
        }
    }

    /**
     * clamps the value
     * @param {number} v value
     * @param {number} min min value
     * @param {number} max max value
     */
    clamp(v, min, max) {
        if (v < min) {
            return min;
        }
        if (v > max) {
            return max;
        }
        return v;
    }

    /**
     * Find random field within 1 and the safevalue
     * @deprecated
     * @param {Array} array 2d
     * @param {number} safeValue 
     * @return {Object} newY, newX
     */
    findRandomGoal(array, safeValue){
        const iterations = 10000;
        let i = 0;

        //start solution
        let newY = Math.floor(Math.random() * this.height);
        let newX = Math.floor(Math.random() * this.width);


        while(array[newY][newX] > 0 && array[newY][newX] <= safeValue && i < iterations){
            newY = Math.floor(Math.random() * this.height);
            newX = Math.floor(Math.random() * this.width);
            i++;
        }

        return {newY,newX};
    }

    /**
     * Calculates the nextMove
     * @return {string} next move
     */
    async nextMove(){
        if(this.useAlternative && this.amIAlone()){ //When you're alone, use space efficiently
            console.log("[Tactic]: Alone -> Using alternative tactic");
            return await this.alternativeTactic();
        }
        this.dataToSend = {
            name: "dangerFields",
            heatMap: []
        };

        let y = this.players[this.you].y;
        let x = this.players[this.you].x;

        this.heatMap = JSON.parse(JSON.stringify(this.cells)); // deep clone
        this.transform(this.heatMap); //transform heatmap to use it in astar
        this.heat(this.heatMap, 5); //build heatmap


        // astar
        let searchOptions = { //TODO: test with or without
            closest: this.closest
        };
        let result = [];
        let goal, end;
        let safeValue = 0.5;
        let graph = new Graph(JSON.parse(JSON.stringify(this.heatMap)));
        let start = graph.grid[y][x];
        while(result.length == 0){
            if(!this.inTime()){ // If time runs out
                result = [{ // TODO: ERROR
                    x: Math.floor(Math.random()*this.width),
                    y: Math.floor(Math.random()*this.height)
                }]; 
                break;
            }
            safeValue += 0.5;
            //goal = this.findRandomGoal(this.heatMap, safeValue); //also solve with astar
            try {
                goal = this.findGoal(safeValue);
            }catch(e){
                console.error("Find Goal Error.");
                goal = {newY: Math.floor(Math.random()*this.height), newX: Math.floor(Math.random()*this.width)};
                searchOptions = {
                    closest: true
                };
            }
            
            end = graph.grid[goal.newY][goal.newX];
            result = astar.search(graph, start, end, searchOptions);
        }
        
        // Monitoring visualization
        this.dataToSend.heatMap = this.heatMap;
        this.dataToSend.result = result;
        
        //result.x | result.y reversed!!
        return await this.moveDependingOnDirection(y, x, result[0].x, result[0].y);
    }

    /**
     * Determinds the correct move depending on players direction,
     * position and the goal coordinates.
     * In case of a "U-Turn" the alternative tactic is used
     * @param {number} y player coordinate
     * @param {number} x player coordinate
     * @param {number} newY goal coordinate
     * @param {number} newX goal coordinate
     * @return {string} next move
     */
    async moveDependingOnDirection(y, x, newY, newX){
        let dir = this.players[this.you].direction;
        if(newY < y){ // want to go up
            switch (dir){
                case "up":
                    return "change_nothing";
                case "down":
                    return await this.alternativeTactic();
                case "right":
                    return "turn_left";
                case "left":
                    return "turn_right";
            }
        }
        if(newY > y){ // want to go down
            switch (dir){
                case "up":
                    return await this.alternativeTactic();
                case "down":
                    return "change_nothing";
                case "right":
                    return "turn_right";
                case "left":
                    return "turn_left";
            }
        }
        if(newX < x){ // want to go left
            switch(dir){
                case "up":
                    return "turn_left";
                case "down":
                    return "turn_right";
                case "right":
                    return await this.alternativeTactic();
                case "left":
                    return "change_nothing";
            }
        }
        if(newX > x){ // want to go right
            switch(dir){
                case "up":
                    return "turn_right";
                case "down":
                    return "turn_left";
                case "right":
                    return "change_nothing";
                case "left":
                    return await this.alternativeTactic();
            }
        }
    }

    /**
     * Calculates the next move with another tactic
     * @return {string} next move
     */
    async alternativeTactic(){
        console.error("Nicht Definiert");
        this.dataToSend = undefined;
        // const options = {
        //     pattern: {
        //         right: 0,
        //         left: 2,
        //         front: 1
        //     }
        // };
        // const dontHit1 = new dontHit(options);
        // dontHit1.updateGameData(this.gameData);
        const options = {
            useRandom: false,
            searchDepth: 10,
            order: ["TR", "CN", "TL", "SD", "SU"]
        };

        const recursiveBnB1 = new recursiveBnB(options);
        recursiveBnB1.updateGameData(this.gameData);

        return await recursiveBnB1.nextMove();
    }

    /**
     * Uses flood fill algorithm to calculate a random goal in the biggest safe area
     * @param {number} safeValue 
     * @return {Object} newY, newX
     */
    findGoal(safeValue){
        let array = JSON.parse(JSON.stringify(this.heatMap));
        let coherentFields = [];

        while(coherentFields.length == 0){
            if(!this.inTime()){
                coherentFields = [[{newY:0,newX:0}]];
                break;
            }
            for(let y = 0; y < array.length; y++){
                for(let x = 0; x < array[0].length; x++){
                    if(array[y][x] <= safeValue && array[y][x] != 0){
                        const result = this.findGoalFloodFill(array, y, x, safeValue);
                        coherentFields.push(result);
                    }
                }
            }
        }
        
        let biggestIndex = 0;
        for(let i = 0; i < coherentFields.length; i++){
            if(coherentFields[biggestIndex].length < coherentFields[i].length){
                biggestIndex = i;
            }
        }

        let fieldsArray = coherentFields[biggestIndex];
        const randomReturn = Math.floor(Math.random()*fieldsArray.length);
        //Monitoring
        this.dataToSend.goalFields = fieldsArray;
        
        return fieldsArray[randomReturn];
    }

    /**
     * intern function of findGoal
     * @param {Array} image 2d array
     * @param {number} sr 
     * @param {number} sc 
     * @param {number} safeValue
     * @return {Array} array of objects 
     */
    findGoalFloodFill(image, sr, sc, safeValue){
        
		const response = this.findGoalfill(image, sr, sc, 100, safeValue);
        
        return response;
    }
    
    /**
     * intern function of findGoalFloodFill
     * @param {Array} image 2d array
     * @param {number} sr 
     * @param {number} sc 
     * @param {number} newColor placeholder color
     * @param {number} current current color
     * @return {Array}
     */
    findGoalfill(image, sr, sc, newColor, current){
        //If row is less than 0
        if(sr < 0){
            return;
        }
    
        //If column is less than 0
        if(sc < 0){
            return;
        }
    
        //If row is greater than image length
        if(sr > image.length - 1){
            return;
        }
    
        //If column is greater than image length
        if(sc > image[sr].length - 1){
            return;
        }
    
        //If the current pixel is not which needs to be replaced
        if(image[sr][sc] > current || image[sr][sc] == 0){
            return;
        }
    
        //Update the new color
        image[sr][sc] = newColor;
        
        let response = [{newY:sr,newX:sc}];
        //Fill in all four directions
        //Fill Prev row
        const res1 = this.findGoalfill(image, sr - 1, sc, newColor, current);
        if(res1 == undefined){
            //do smth
        }else {
            response = response.concat(res1);
        }
        
        //Fill Next row
        const res2 = this.findGoalfill(image, sr + 1, sc, newColor, current);
        if(res2 == undefined){
            //do smth
        }else{
            
            response = response.concat(res2);
        }
        

        //Fill Prev col
        const res3 = this.findGoalfill(image, sr, sc - 1, newColor, current);
        if(res3 == undefined){
            //do smth
        }else {
            response = response.concat(res3);
        }
        

        //Fill next col
        const res4 = this.findGoalfill(image, sr, sc + 1, newColor, current);
        if(res4 == undefined){
            //do smth
        }else {
            response = response.concat(res4);
        }
        return response;
    }

}