//npm
import mongoose from "mongoose";
// eslint-disable-next-line no-unused-vars
import * as colors from "colors";
//imports
import models from "./models/models";

// MongoDB Connection 
const url = "mongodb://lucekiclient:3m3aMhHopjaiLFVrUW1H@85.214.102.24:27017/luceki";
const connectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

//Database Connection
let db;
try{
    db = mongoose.connect(url, connectionOptions);
}catch(e){
    console.error("[DB]: Connection failed");
}
db.then(async () => {
    console.log("[DB]: Connected to MongoDB");
});

/**
 * Store a full game in the db.
 * Devided in protocoll and endTableau model
 * @param {Array} rounds 
 * @param {Array} cells 
 * @param {string} tactic 
 */
const pushProtokoll = async (rounds, cells, tactic) => {
    let id = mongoose.Types.ObjectId();
    const protokoll = new models.Protokoll({
        rounds,
        cellsId: id,
        tactic
    });
    const endTableau = new models.EndTableau({
        cells,
        _id: id
    });
    
    await protokoll.save().then(() => {
        console.log("[DB]: Saved Protocoll");
    }); 
    await endTableau.save().then(() => {
        console.log("[DB]: Saved EndTableau");
    });
};

/**
 * returns game history
 * @return {Object}
 */
const getGameHistory = async () => {
    //options einbinden, injections abfangen
    return await models.Protokoll.find({}).sort({createdAt: "desc"}).limit(20);
};

/**
 * getGame
 * @param {number} gameId 
 * @return {Object} {game, endTableau}
 */
const getGame = async (gameId) => {
    const game = await models.Protokoll.findOne({_id: gameId});
    const tableau = await models.EndTableau.findOne({_id: game.cellsId});
    return {
        game,
        endTableau: tableau
    };
};

export { db, pushProtokoll, getGameHistory, getGame };