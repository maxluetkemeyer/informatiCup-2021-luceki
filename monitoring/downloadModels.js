/* eslint-disable require-jsdoc */
/* eslint-disable no-unused-vars */
import http from "http";
import fs from "fs";

import {sendMessage} from "./monitoring";

const host = "geoclash.net";
const port = 4444;
const path = "";
/**
 * Download KI models from our server
 */
export const getModelList = () => {
    const options = {
        host: host,
        port: port,
        path: path,
        timeout: 3000
    };
    let str = "";
    try{
        let request = http.request(options, (res) => {
            res.on("data", (chunk) => {
                str += chunk;
            });
    
            //the whole response has been received
            res.on("end", () => {
                console.log(str);
                let result = JSON.parse(str).filesArray;
                console.log(result);
                downloadFiles(result);
            });
    
            res.on("timeout", () => {
                // eslint-disable-next-line no-undef
                request.abort();
                console.log("Timeout");
            });
    
            res.on("error", () => {
                console.log("ERROR");
            });
        }).end();

        request.on("error", function(err) {
            sendMessage("Error downloading new models");
            console.log("Error downloading new models");
        });
    }catch(e){
        sendMessage("Error downloading new models");
        console.log("Error downloading new models");
    }
    
};

const downloadFiles = (folderArray) => {
    try{
        for(let i = 0; i < folderArray.length; i++){
            if (!fs.existsSync("./riLearning/models/"+folderArray[i])){
                fs.mkdirSync("./riLearning/models/"+folderArray[i]);
            }
            let model = fs.createWriteStream("./riLearning/models/"+folderArray[i]+"/model.json");
            let weights = fs.createWriteStream("./riLearning/models/"+folderArray[i]+"/weights.bin");
            let modelRequest = http.get("http://"+host+":"+port+"/public/"+folderArray[i]+"/model.json", function(response) {
                response.pipe(model);
            });
            let weightsRequest = http.get("http://"+host+":"+port+"/public/"+folderArray[i]+"/weights.bin", function(response) {
                response.pipe(weights);
            });
    
        }
        sendMessage("Download complete! Reload to see all new models");
    }catch(e){
        sendMessage("Error downloading new models");
        console.log("Error downloading new models");
    }
    
};