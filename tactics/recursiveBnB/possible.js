/**
 * examines whether speed can be hold
 * @param {object} d gameData
 * @param {number} playerId id of player
 * @param {number} round number of rounds (for jumps)
 */
const changeNothing = (d, playerId, round) => {
    // current position
    let headRow = d.players[playerId].y;
    let headColumn = d.players[playerId].x;
    //console.log("[possible debug]: round "+round +"; ist changeNothing für spieler "+ playerId +" mit x " + headColumn + ", y " + headRow + ", speed " + d.players[playerId].speed + ", direction " + d.players[playerId].direction + " möglich?");
    // works for all speeds due the speed counter
    let speedCounter = 0;
    let jump = 0;
    // player jumps every sixt round when speed is 3 or more
    if (round % 6 == 0 && (d.players[playerId].speed - 2) > 0) {
        // bad jump
        // in cases of all directions
        switch (d.players[playerId].direction) {
            case "up":
                if (!isFieldLegit(d, headRow - d.players[playerId].speed, headColumn) || !isFieldLegit(d, headRow - 1, headColumn)) {
                    // sprung ins leere --> abbruch
                    return false;
                } else {
                    return true;
                }
                break;
            case "down":
                if (!isFieldLegit(d, headRow + d.players[playerId].speed, headColumn) || !isFieldLegit(d, headRow + 1, headColumn)) {
                    // sprung ins leere --> abbruch
                    return false;
                } else {
                    return true;
                }
                break;
            case "left":
                if (!isFieldLegit(d, headRow, headColumn - d.players[playerId].speed) || !isFieldLegit(d, headRow, headColumn - 1)) {
                    // sprung ins leere --> abbruch
                    return false;
                } else {
                    return true;
                }
                break;
            case "right":
                if (!isFieldLegit(d, headRow, headColumn + d.players[playerId].speed) || !isFieldLegit(d, headRow, headColumn + 1)) {
                    // sprung ins leere --> abbruch
                    return false;
                } else {
                    return true;
                }
                break;
        }
        jump = d.players[playerId].speed - 2;
    }
    // iterate to players speed (bc. thats the amount of fields to check)
    for (let i = 1; i <= d.players[playerId].speed; i++) {
        // in cases of all directions
        switch (d.players[playerId].direction) {
            case "up":
                if (isFieldLegit(d, headRow - i, headColumn)) {
                    speedCounter++;
                }
                break;
            case "down":
                if (isFieldLegit(d, headRow + i, headColumn)) {
                    speedCounter++;
                }
                break;
            case "left":
                if (isFieldLegit(d, headRow, headColumn - i)) {
                    speedCounter++;
                }
                break;
            case "right":
                if (isFieldLegit(d, headRow, headColumn + i)) {
                    speedCounter++;
                }
                break;
        }
        // jump (=0 when no jump happens) and update counter with jump
        i = i + jump;
        speedCounter = speedCounter + jump;
    }
    // if all required fields are free the speed counter matches player speed
    if (speedCounter >= d.players[playerId].speed) {
        //console.log("[possible debug]: --> JA");
        return true;
    } else {
        //console.log("[possible debug]: --> NEIN");
        return false;
    }
};

/**
 * examines whether speed can be increased
 * @param {object} d gameData
 * @param {number} playerId id of player
 * @param {number} round number of rounds (for jumps)
 */
const speedUp = (d, playerId, round) => {
        // dont get to fast :)
        if(d.speed > 8) {
            return false;
        }
        // current position
        let headRow = d.players[playerId].y;
        let headColumn = d.players[playerId].x;
        //console.log("[possible debug]: round "+round +";  ist speedUp für spieler "+ playerId +" mit x " + headColumn + ", y " + headRow + ", speed " + d.players[playerId].speed + ", direction " + d.players[playerId].direction + " möglich?");
        // works for all speeds due the speed counter
        let speedCounter = 0;
        // player jumps every sixt round when speed is 3 or more
        let jump = 0;
        if (round % 6 == 0 && (d.players[playerId].speed - 2) > 0) {
            // sprung ins leere abfangen
            // in cases of all directions
            switch (d.players[playerId].direction) {
                case "up":
                    if (!isFieldLegit(d, headRow - (d.players[playerId].speed+1), headColumn) || !isFieldLegit(d, headRow - 1, headColumn)) {
                        // sprung ins leere --> abbruch
                    return false;
                    }else {
                        return true;
                    }
                    break;
                case "down":
                    if (!isFieldLegit(d, headRow + (d.players[playerId].speed+1), headColumn) || !isFieldLegit(d, headRow + 1, headColumn)) {
                        // sprung ins leere --> abbruch
                    return false;
                    }else {
                        return true;
                    }
                    break;
                case "left":
                    if (!isFieldLegit(d, headRow, headColumn - (d.players[playerId].speed+1)) || !isFieldLegit(d, headRow, headColumn - 1)) {
                        // sprung ins leere --> abbruch
                    return false;
                    }else {
                        return true;
                    }
                    break;
                case "right":
                    if (!isFieldLegit(d, headRow, headColumn + (d.players[playerId].speed+1)) || !isFieldLegit(d, headRow, headColumn + 1)) {
                        // sprung ins leere --> abbruch
                    return false;
                    }else {
                        return true;
                    }
                    break;
            }
            jump = d.players[playerId].speed - 2;
        }
        // iterate to players speed (bc. thats the amount of fields to check)
        for (let i = 1; i <= d.players[playerId].speed + 1; i++) { 
            // speed-increment bc. we check fields for a potential speed up
            // in cases of all directions
            switch (d.players[playerId].direction) {
                case "up":
                    if (isFieldLegit(d, headRow - i, headColumn)) {
                        speedCounter++;
                    }
                    break;
                case "down":
                    if (isFieldLegit(d, headRow + i, headColumn)) {
                        speedCounter++;
                    }
                    break;
                case "left":
                    if (isFieldLegit(d, headRow, headColumn - i)) {
                        speedCounter++;
                    }
                    break;
                case "right":
                    if (isFieldLegit(d, headRow, headColumn + i)) {
                        speedCounter++;
                    }
                    break;
            }
            // jump (=0 when no jump happens) and update counter with jump
            i = i + jump;
            speedCounter = speedCounter + jump;
        }
        // if all required fields are free the speed counter matches player speed+1
        if (speedCounter >= d.players[playerId].speed + 1) {
            //console.log("[possible debug]: --> JA");
            return true;
        } else {
            //console.log("[possible debug]: --> NEIN");
            return false;
        }
};

/**
 * examines whether speed can be decreased
 * @param {object} d gameData
 * @param {number} playerId id of player
 * @param {number} round number of rounds (for jumps) 
 */
const slowDown = (d, playerId, round) => {
    // player cannot go slower than speed 1
    if (d.players[playerId].speed <= 1) {
        //console.log("[possible debug]: slowDown ABGELEHNT weil speed=1");
        return false;
    }
    // current position
    let headRow = d.players[playerId].y;
    let headColumn = d.players[playerId].x;
    //console.log("[possible debug]:  round "+round +"; ist slowDown für spieler "+ playerId +" mit x " + headColumn + ", y " + headRow + ", speed " + d.players[playerId].speed + ", direction " + d.players[playerId].direction + " möglich?");
    // works for all speeds due the speed counter
    let speedCounter = 0;
    let jump = 0;
    // player jumps every sixt round when speed is 3 or more
    if (round % 6 == 0 && (d.players[playerId].speed - 2) > 0) {
        // sprung ins leere abfangen
        // in cases of all directions
        switch (d.players[playerId].direction) {
            case "up":
                if (!isFieldLegit(d, headRow - (d.players[playerId].speed-1), headColumn) || !isFieldLegit(d, headRow - 1, headColumn)) {
                    // sprung ins leere --> abbruch
                    return false;
                } else {
                    return true;
                }
                break;
            case "down":
                if (!isFieldLegit(d, headRow + (d.players[playerId].speed-1), headColumn) || !isFieldLegit(d, headRow + 1, headColumn)) {
                    // sprung ins leere --> abbruch
                    return false;
                } else {
                    return true;
                }
                break;
            case "left":
                if (!isFieldLegit(d, headRow, headColumn - (d.players[playerId].speed-1)) || !isFieldLegit(d, headRow, headColumn - 1)) {
                    // sprung ins leere --> abbruch
                    return false;
                } else {
                    return true;
                }
                break;
            case "right":
                if (!isFieldLegit(d, headRow, headColumn + (d.players[playerId].speed-1)) || !isFieldLegit(d, headRow, headColumn + 1)) {
                    // sprung ins leere --> abbruch
                    return false;
                } else {
                    return true;
                }
                break;
        }
        jump = d.players[playerId].speed - 2;
    }
    // iterate to players speed (bc. thats the amount of fields to check)
    for (let i = 1; i <= d.players[playerId].speed - 1; i++) {
        // in cases of all directions
        switch (d.players[playerId].direction) {
            case "up":
                if (isFieldLegit(d, headRow - i, headColumn)) {
                    speedCounter++;
                }
                break;
            case "down":
                if (isFieldLegit(d, headRow + i, headColumn)) {
                    speedCounter++;
                }
                break;
            case "left":
                if (isFieldLegit(d, headRow, headColumn - i)) {
                    speedCounter++;
                }
                break;
            case "right":
                if (isFieldLegit(d, headRow, headColumn + i)) {
                    speedCounter++;
                }
                break;
        }
        // jump (=0 when no jump happens) and update counter with jump
        i = i + jump;
        speedCounter = speedCounter + jump;
    }
    // if all required fields are free the speed counter matches player speed-1
    if (speedCounter >= d.players[playerId].speed - 1) {
        //console.log("[possible debug]: --> JA");
        return true;
    } else {
        //console.log("[possible debug]: --> NEIN");
        return false;
    }
};

/**
 * examines whether player can turn right
 * @param {object} d gameData
 * @param {number} playerId id of player
 * @param {number} round number of rounds (for jumps) 
 */
const turnRight = (d, playerId, round) => {
    // current position
    let headRow = d.players[playerId].y;
    let headColumn = d.players[playerId].x;
    //console.log("[possible debug]: round "+round +";  ist turnRight für spieler "+ playerId +" mit x " + headColumn + ", y " + headRow + ", speed " + d.players[playerId].speed + ", direction " + d.players[playerId].direction + " möglich?");
    // works for all speeds due the speed counter
    let speedCounter = 0;
    let jump = 0;
    // player jumps every sixt round when speed is 3 or more
    if (round % 6 == 0 && (d.players[playerId].speed - 2) > 0) {
        // sprung ins leere abfangen
        // in cases of all directions
        switch (d.players[playerId].direction) {
            case "up":
                if (!isFieldLegit(d, headRow, headColumn + d.players[playerId].speed) || !isFieldLegit(d, headRow, headColumn + 1)) {
                    // sprung ins leere --> abbruch
                    return false;
                } else {
                    return true;
                }
                break;
            case "down":
                if (!isFieldLegit(d, headRow, headColumn - d.players[playerId].speed) || !isFieldLegit(d, headRow, headColumn - 1)) {
                    // sprung ins leere --> abbruch
                    return false;
                } else {
                    return true;
                }
                break;
            case "left":
                if (!isFieldLegit(d, headRow - d.players[playerId].speed, headColumn) || !isFieldLegit(d, headRow - 1, headColumn)) {
                    // sprung ins leere --> abbruch
                    return false;
                } else {
                    return true;
                }
                break;
            case "right":
                if (!isFieldLegit(d, headRow + d.players[playerId].speed, headColumn) || !isFieldLegit(d, headRow + 1, headColumn)) {
                    // sprung ins leere --> abbruch
                    return false;
                } else {
                    return true;
                }
                break;
        }
        jump = d.players[playerId].speed - 2;
    }
    // iterate to players speed (bc. thats the amount of fields to check)
    for (let i = 1; i <= d.players[playerId].speed; i++) {
        // in cases of all directions
        switch (d.players[playerId].direction) {
            case "up":
                if (isFieldLegit(d, headRow, headColumn + i)) {
                    speedCounter++;
                }
                break;
            case "down":
                if (isFieldLegit(d, headRow, headColumn - i)) {
                    speedCounter++;
                }
                break;
            case "left":
                if (isFieldLegit(d, headRow - i, headColumn)) {
                    speedCounter++;
                }
                break;
            case "right":
                if (isFieldLegit(d, headRow + i, headColumn)) {
                    speedCounter++;
                }
                break;
        }
        // jump (=0 when no jump happens) and update counter with jump
        i = i + jump;
        speedCounter = speedCounter + jump;
    }
    // if all required fields are free the speed counter matches player speed
    if (speedCounter >= d.players[playerId].speed) {
        //console.log("[possible debug]: --> JA");
        return true;
    } else {
        //console.log("[possible debug]: --> NEIN");
        return false;
    }
};

/**
 * examines whether player can turn left
 * @param {object} d gameData
 * @param {number} playerId id of player
 * @param {number} round number of rounds (for jumps) 
 */
const turnLeft = (d, playerId, round) => {
    // current position
    let headRow = d.players[playerId].y;
    let headColumn = d.players[playerId].x;
    //console.log("[possible debug]: round "+round +";  ist turnLeft für spieler "+ playerId +" mit x " + headColumn + ", y " + headRow + ", speed " + d.players[playerId].speed + ", direction " + d.players[playerId].direction + " möglich?");
    // works for all speeds due the speed counter
    let speedCounter = 0;
    let jump = 0;
    // player jumps every sixt round when speed is 3 or more
    if (round % 6 == 0 && (d.players[playerId].speed - 2) > 0) {
        // sprung ins leere abfangen
        // in cases of all directions
        switch (d.players[playerId].direction) {
            case "up":
                if (!isFieldLegit(d, headRow, headColumn - d.players[playerId].speed) || !isFieldLegit(d, headRow, headColumn - 1)) {
                    // sprung ins leere --> abbruch
                    return false;
                } else {
                    return true;
                }
                break;
            case "down":
                if (!isFieldLegit(d, headRow, headColumn + d.players[playerId].speed) || !isFieldLegit(d, headRow, headColumn + 1)) {
                    // sprung ins leere --> abbruch
                    return false;
                } else {
                    return true;
                }
                break;
            case "left":
                if (!isFieldLegit(d, headRow + d.players[playerId].speed, headColumn) || !isFieldLegit(d, headRow + 1, headColumn)) {
                    // sprung ins leere --> abbruch
                    return false;
                } else {
                    return true;
                }
                break;
            case "right":
                if (!isFieldLegit(d, headRow - d.players[playerId].speed, headColumn) || !isFieldLegit(d, headRow - 1, headColumn)) {
                    // sprung ins leere --> abbruch
                    return false;
                } else {
                    return true;
                }
                break;
        }
        jump = d.players[playerId].speed - 2;
    }
    // iterate to players speed (bc. thats the amount of fields to check)
    for (let i = 1; i <= d.players[playerId].speed; i++) {
        // in cases of all directions
        switch (d.players[playerId].direction) {
            case "up":
                if (isFieldLegit(d, headRow, headColumn - i)) {
                    speedCounter++;
                }
                break;
            case "down":
                if (isFieldLegit(d, headRow, headColumn + i)) {
                    speedCounter++;
                }
                break;
            case "left":
                if (isFieldLegit(d, headRow + i, headColumn)) {
                    speedCounter++;
                }
                break;
            case "right":
                if (isFieldLegit(d, headRow - i, headColumn)) {
                    speedCounter++;
                }
                break;
        }
        // jump (=0 when no jump happens) and update counter with jump
        i = i + jump;
        speedCounter = speedCounter + jump;
    }
    // if all required fields are free the speed counter matches player speed
    if (speedCounter >= d.players[playerId].speed) {
        //console.log("[possible debug]: --> JA");
        return true;
    } else {
        //console.log("[possible debug]: --> NEIN");
        return false;
    }
};

/**
 * returns true if given field is legit (free)
 * @param {object} d gameData
 * @param {number} row  x-value
 * @param {number} column max legit y-value
 */
const isFieldLegit = (d, row, column) => {
    // if coordinates are free and inside the cells array
    if ((row >= 0) && (row < d.height) && (column >= 0) && (column < d.width)) {
        if (d.cells[row][column] == 0) {
            //console.log("[tactic]: cell in (row " + row + ", column " + column + ") is legit");
            return true;
        }
    } else {
        //console.log("[tactic]: cell in (row " + row + ", column " + column + ") is illegitimate");
        return false;
    }
};

//export methods to use them in tacticts and the testServer
export { speedUp, changeNothing, slowDown, turnRight, turnLeft };