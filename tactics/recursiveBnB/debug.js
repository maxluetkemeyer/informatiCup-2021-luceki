//npm
import fs from "fs";
import path from "path";
// debug test protocol
const testProtocol = JSON.parse(fs.readFileSync(path.join(__dirname, "../testProtocolls/testProtocol2.json")));
const testData = testProtocol[42];

/**
 * logs a tableau
 * @param {Array} tableau 
 */
const logTableau = (tableau) => {
    console.log("");
    let row = ["[tableau]:"];
    for (let i = 0; i < tableau.length; i++) {
        row[i + 1] = "";
        for (let j = 0; j < tableau[0].length; j++) {
            // sentinel werden als ∞ dargestellt
            if (tableau[i][j] == 0) {
                row[i + 1] = row[i + 1] + "_";
            } else {
                row[i + 1] = row[i + 1] + tableau[i][j].toString();
            }
        }
        row[i + 1] = row[i + 1] + " [" + i + ". row]";
    }
    for (let i = 0; i < row.length; i++) {
        console.log(row[i]);
    }
};

export {testData, logTableau};