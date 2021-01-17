// npm
import express from "express";
import http from "http";
import https from "https";
import fs from "fs";
import path from "path";

// imports
import * as app from "../app.js";
import * as db from "../database/db.js";
import {getModelList} from "./downloadModels";

// Webserver
const expressApp = express();
// set the view engine to ejs
expressApp.set("view engine", "ejs");
expressApp.set("views", path.join(__dirname, "/views"));
expressApp.use(express.static("dist"));

// index page
/**
 * get all models
 * @param {string} source 
 */
const getDirectories = source => 
    fs.readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
const dirs = getDirectories("./riLearning/models/");

expressApp.locals.dirs = dirs;
expressApp.get("/", function(req, res) {
  res.render("pages/index");
});

// about page
expressApp.get("/history", function(req, res) {
  res.render("pages/history");
});

let httpServer;
let webServer;
let io;

//Variables
let autostart = false;
let lastOptions;

/**
 * initilaizes the webServer
 * @param {number} HTTPSPORT 
 */
const initWebserver = (HTTPSPORT) => {
  if(HTTPSPORT == 443){
    httpServer = http.createServer((req, res) => {
      res.writeHead(301, {Location: "https://localhost:"+HTTPSPORT});
      res.end();
    });
    httpServer.listen(80, () => console.log("[Web]: Started on Port 80 (http)"));
  }
  const httpsOptions = {
    key: fs.readFileSync("./misc/ssl/localhost.key"),
    cert: fs.readFileSync("./misc/ssl/localhost.crt")
  };
  webServer = https.createServer(httpsOptions, expressApp);
  webServer.listen(HTTPSPORT, () => console.log(`[Web]: Started on Port ${HTTPSPORT} (https)`));

  io = require("socket.io")(webServer); //muss hier stehen, da der fertige webServer anscheinend uebergeben werden muss
  initIo();
};

/**
 * Sends the gameData to the client
 * @param {object} gameData 
 */
const update = (gameData) => {
  io.emit("update", gameData);
};

/**
 * download models from webserver
 */
const downloadModel = () => {
  sendMessage("Starting download models from server... (this may take a while)");
  try{
    getModelList();
  }catch(e){
    sendMessage("Model download failed!");
  }
};

/**
 * Sends the initialize call to the client
 */
const queue = () => {
  io.emit("queue");
};

/**
 * Sends the nextMove to the client
 * @param {string} move 
 */
const sendMove = (move) => {
  io.emit("sendMove", move);
};

/**
 * Sends a message to the client
 * @param {string} message 
 */
const sendMessage = (message) => {
  io.emit("message", message);
};

/**
 * Send tactic data to the client. 
 * @param {Object} data tactic data includes calcTime and maybe dataToSend.
 */
const sendTacticData = (data) => {
  io.emit("tacticData", data);
};

/**
 * Tells the client whether the game has ended or the player was eliminated.
 * @param {string} options finnaly | eliminated
 */
const sendGameEnd = (option) => {
  io.emit("gameEnd", option);
};
//######################### Socket Server #########################

/**
 * Init socket.io
 */
const initIo = () => {
  io.on("connection", (socket) => {
    //Sends the current autostart status
    socket.emit("status", {
      autostart
    });
    
  
    //Client starts queue
    socket.on("startGame", (options) => {
      app.startGame(options);
    });
  
    //Client asks for game list
    socket.on("getHistoryList", async (options) => {
      const history = await db.getGameHistory(options);
      socket.emit("getHistoryList", history);
    });
  
    //Client asks for round list of a game
    socket.on("getGame", async (gameId) => {
      const game = await db.getGame(gameId);
      const gameProtocol = game.game;
      const endTableau = game.endTableau.cells;
      socket.emit("getGame", gameProtocol, endTableau);
    });
  
    //Client changes autostart status
    socket.on("autostart", (value) => {
      autostart = value;
      console.log("autostart: "+autostart);
    });

    socket.on("downloadModels", () => {
      downloadModel();
    });
  });
};


export { update, queue , autostart, lastOptions, initWebserver, sendMove, sendGameEnd, sendMessage, sendTacticData};