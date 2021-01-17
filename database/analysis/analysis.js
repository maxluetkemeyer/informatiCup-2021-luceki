/* eslint-disable no-unused-vars */
//npm
import mongoose from "mongoose";
//imports
import models from "../models/models";
import {db} from "../db";
import fs from "fs";

// After connection successful we get can get data from the DB

db.then(async () => {
    console.log("[Analysis]: Connected to MongoDB");
    query();
});



// 
/**
 * get the Data from DB with blank query. We get all protocols. THough we could filter it by tactics, if wanted.
 */
const query =  async () => {
    //options einbinden, injections abfangen
    const queryResult = await  models.Protokoll.find(); //here we can filter by used tactics
    let gameReportsMixedDB = analyseGames(queryResult);
    console.log(analyseTactics(gameReportsMixedDB));
    mongoose.connection.close();
};


//In dieser Datei wird die Funktion, getGameReport geschrieben. Mit dieser kann man einzelne Spiele auf einen Sieg auswerten. Damit werden größere Mengen von Spielen ausgewertet. Dafür nutzen wir eine große JSON DAtei mit vielen Spielen. Diese DAteien sind leider zu groß für das Git. Diese sind jedoch ein Array aus JSON Objekten. Die Dummy Datensätze sind Auschnitte und stehen beispielhaft für eine Game-JSON
/**
 * get last round Info
 * @param {Object} data 
 * @return {Object} Tupel (lastRoundNr,lastRound)
 */
function getLastRoundInfo(data) {
    const lastRound = data.rounds[data.rounds.length-1];
    const lastRoundNr =data.rounds.length;
    return {lastRoundNr,lastRound};
}

/**
 * Returns the name of the used Tactic
 * @param {Object} game A JSON Object with all respective rounds of a Game and the additional attributes
 * @return {string} The tactic
 */
function getTacticName(game) {
    let tacticName = game.tactic;  
    return tacticName;
}

/**
 * takes a round an looks whether is player active
 * @param {number} round The numeber the round, we want to check
 * @param {number} player The number of the player
 * @return {boolean}
 */
function isActive(round,player) {
    //console.log(round.running);
    return round.players[player].active;

}

/**
 * Gives true when the player won the game
 * @param {Object} game A JSON Object with all respective rounds of a Game and the additional attributes
 * @return {boolean}
 */
function isGameAWin(game) {
    const lastRoundInfo = getLastRoundInfo(game);// :)
    const lastRoundData = lastRoundInfo.lastRound;
    const you = getLastRoundInfo(game).lastRound.you;
    const won = isActive(lastRoundData,you);
    if (won) {
        //console.log("This round is won after "+amountRounds+ " rounds :)" );
        return true;
    } else {
        //console.log("This round is a loss after "+amountRounds+ " rounds. :(" );
        return false;
    }
}

/**
 * Analyses the Game-JSON and creates the Gamereport, consisting of tactic, won, amountRounds, timestamp
 * AnalyseGames(games) is responsive to check if the data is valid or corrupted. Game must be valid.
 * @param {Object} game A JSON Object with all respective rounds of a Game and the additional attributes
 * @return {Object}
 */
function getGameReport(game) {
    const tactic = getTacticName(game);
    const lastRoundInfo = getLastRoundInfo(game);// :)
    const amountRounds = lastRoundInfo.lastRoundNr;
    const won = isGameAWin(game);
    // eslint-disable-next-line no-unused-vars
    const timestamp = game.createdAt.$date;
    const gameReport = {tactic, won, amountRounds/*,timestamp*/}; //timestamp geht aber debug is dann nicht schön. vorrübergehend auskommentiert.
    return gameReport;
}

/**
 * iterates over the array and analyses the games (ignores broke Games) and returns gameReports
 * @param {*} game A JSON Object with all respective rounds of a Game and the additional attributes
 */
function analyseGames(games) {
    let gameReports = [];
    for (let i = games.length-1; i >= 0; i--) {
        try{
            if (getLastRoundInfo(games[i]).lastRound !== undefined) { //prevent broke data to return false results. they are not even pushed to to reportsArray
                gameReports.push(getGameReport(games[i]));
            }
            
        } catch(e){
            i--;
            console.log("Ungültige Daten errreicht und fehler gecatched ;)");
            console.log(getLastRoundInfo(games[i]));
            console.log(games[i]._id);
            console.log("Folgend eine Erhebung mit Stichprobenumfang "+ gameReports.length);
            return gameReports;} //abbrechen
        }
        console.log("Folgend eine Erhebung mit Stichprobenumfang "+ gameReports.length + ". Das können aber noch defekte Daten sein. Genaue Summe ist in der Analyse.");
        return gameReports;
}

/**
 * Takes array of gamereports and calculates the win rates, in absolute and relative frequency
 * @param {Array} gameReports A array of multiple gameReports, created by getGameReport(game) 
 * @return {Object}
 */
function analyseTactics(gameReports) {
    let counterTactics = { //works
        sumdontHit : 0,
        winsdontHit : 0,
        winsdontHitRelative :0,
        sumdontHitSemiRandom : 0,
        winsdontHitSemiRandom : 0,
        winsdontHitSemiRandomRelative :0,
        sumrecursiveBnB : 0,
        winsrecursiveBnB : 0,
        winsrecursiveBnBRelative : 0,
        sumDangerFields : 0,
        winsDangerFields : 0,
        winsDangerFieldsRelative : 0,
        sum : 0,
        totalWinRate : 0
    };
    for (let i = 0; i < gameReports.length; i++) {
        switch (gameReports[i].tactic) {
            case "dontHit":
                counterTactics.sumdontHit +=1;
                counterTactics.sum +=1;
                if (gameReports[i].won) {
                    counterTactics.winsdontHit +=1;
                }
                counterTactics.winsdontHitRelative = counterTactics.winsdontHit/counterTactics.sumdontHit;
                break;
        
                
            case "dontHitSemiRandom":
                counterTactics.sumdontHitSemiRandom +=1;
                counterTactics.sum +=1;
                if (gameReports[i].won) {
                    counterTactics.winsdontHitSemiRandom +=1;
                }
                counterTactics.winsdontHitSemiRandomRelative = counterTactics.winsdontHitSemiRandom/counterTactics.sumdontHitSemiRandom;
                break;
        
            case "recursiveBnB":
                counterTactics.sumrecursiveBnB +=1;
                counterTactics.sum +=1;
                if (gameReports[i].won) {
                    counterTactics.winsrecursiveBnB +=1;
                }
                counterTactics.winsrecursiveBnBRelative = counterTactics.winsrecursiveBnB/counterTactics.sumrecursiveBnB;
                break;
        
            case "Danger Fields":
                counterTactics.sumDangerFields +=1;
                counterTactics.sum +=1;
                if (gameReports[i].won) {
                    counterTactics.winsDangerFields +=1;
                }
                counterTactics.winsDangerFieldsRelative = counterTactics.winsDangerFields/counterTactics.sumDangerFields;
                break;
                default:
                break;
        }
    }
    counterTactics.totalWinRate = (counterTactics.winsdontHit+ counterTactics.winsdontHitSemiRandom+counterTactics.winsrecursiveBnB+counterTactics.winsDangerFields)/counterTactics.sum;
    return counterTactics;
}


// manual check w/o DB
// let gameReportsMixed = analyseGames(allGames);
// console.log("Wir starten nun eine Rechnung: ");
// console.log("Wir werten eine Liste an spielen aus auf Erfolg pro Taktik");
// console.log("Das ist das Analyseergebnis von der Datei AllGames");
// console.log(analyseTactics(gameReportsMixed));



// console.log(gameReportsMixed[1].tactic)
// console.log(gameReportsMixed);
// console.log("yeeeeeee start");
// console.log(exampleLastRound);
// console.log("yeeeeeeeee");


// console.log(allGames);
// console.log("anaylses BnB einzeln "); -> funktionert gut
// console.log(recBnBDatenSatz.length);
// console.log(analyseTactics(analyseGames(recBnBDatenSatz)));



/**
 * verifies the max width and height our players have seen so far playing games 
 * @param {Object} games 
 */
function maxWidthundHeight(games) {
    let width = [];
    let height = [];
    for (let i = 0; i < games.length; i++) {
        if (games[i].rounds[1] !== undefined) { //checks if data legit
            width.push(games[i].rounds[1].width);
            height.push(games[i].rounds[1].height);
        }
    } 
    console.log("MAximale Breite ist " + Math.max(...width));
    console.log("MAximale Höhe ist " + Math.max(...height));
}

// maxWidthundHeight(allGames)








{//bloat
//console.log(getLastRoundInfo(dummyLastRound));
//console.log(isGameAWin(dummy));
//console.log(isActive(dummyLastRound));
//console.log(dummyLastRound.lastRound);
//console.log(getLastRoundInfo(dummy).lastRound);
//console.log(isGameAWin(dummy));
}




// console.log(getGameReport(allGames[893]));
// console.log(isActive(dummyLastRound));

// console.log(getLastRoundInfo(allGames[893]));
// console.log(getGameReport(allGames[893]));

// console.log(getLastRoundInfo(dummy).lastRound.you);
// console.log(getGameReport(dummyWin));



// //dummy data for debug and analysis
// decomment if needed
// for real analysis 
// let dummy = JSON.parse(fs.readFileSync('database/analysis/dummy.json')); // diese runde verloren
// let allGames = JSON.parse(fs.readFileSync('analysis/allGames.json'));
// let exampleLastRound = getLastRoundInfo(allGames[1])
// // ObjectID("5ff476b9cc7ed92b0f6e482e") this game is broke
// const dummyLastRound = getLastRoundInfo(dummy) //index 1 gibt rundendaten und index 0 nur rundenr
// let dummyLoss = JSON.parse(fs.readFileSync('database/analysis/dummyLoss.json'));
// let dummyWin = JSON.parse(fs.readFileSync('database/analysis/dummyWin.json'));
// let recBnBDatenSatz = JSON.parse(fs.readFileSync('database/analysis/recBNBAnalysisTest.json'));


