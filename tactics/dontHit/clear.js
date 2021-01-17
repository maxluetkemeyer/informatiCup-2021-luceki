/**
 * ist front frei
 */
const front = (gameData) => {
    // aktuelle postion speichern
    let headZeile = gameData.players[gameData.you].y;
    let headSpalte = gameData.players[gameData.you].x;

    // je nach geschwindigkeit n felder pruefen
    // counter zaehlt 
    let counter = 0;
    for (let i = 1; i<=gameData.players[gameData.you].speed; i++) {
        // je nach aktueller bewegungsrichtung 
        switch (gameData.players[gameData.you].direction) {
            case "up": 
                if (isLegit(gameData, headZeile-i, headSpalte)) {
                    counter++;
                }
                break;
            case "down": 
                if (isLegit(gameData, headZeile+i, headSpalte)) {
                    counter++;
                } 
                break;
            case "left": 
                if (isLegit(gameData, headZeile, headSpalte-i)) {
                    counter++;
                }
                break; 
            case "right": 
                if (isLegit(gameData, headZeile, headSpalte+i)) {
                    counter++;
                } 
                break;     
        }
    }

    // sind alle benoetigten felder frei?
    if (counter == gameData.players[gameData.you].speed) {
        return true;
    } else {
        return false;
    }
};

/**
 * ist rechts frei
 */
const right = (gameData) => {
    // aktuelle postion speichern
    let headZeile = gameData.players[gameData.you].y;
    let headSpalte = gameData.players[gameData.you].x;

    // je nach geschwindigkeit n felder pruefen
    // counter zaehlt 
    let counter = 0;
    for (let i = 1; i<=gameData.players[gameData.you].speed; i++) {
        // je nach aktueller bewegungsrichtung 
        switch (gameData.players[gameData.you].direction) {
            case "up": 
                if (isLegit(gameData, headZeile, headSpalte+i)) {
                    counter++;
                }
                break;
            case "down": 
                if (isLegit(gameData, headZeile, headSpalte-i)) {
                    counter++;
                } 
                break;
            case "left": 
                if (isLegit(gameData, headZeile-i, headSpalte)) {
                    counter++;
                } 
                break;
            case "right": 
                if (isLegit(gameData, headZeile+i, headSpalte)) {
                    counter++;
                }   
                break;   
        }
    }

    // sind alle benoetigten felder frei?
    if (counter == gameData.players[gameData.you].speed) {
        return true;
    } else {
        return false;
    }
};

/**
 * ist links frei
 */
const left = (gameData) => {
    // aktuelle postion speichern
    let headZeile = gameData.players[gameData.you].y;
    let headSpalte = gameData.players[gameData.you].x;

    // je nach geschwindigkeit n felder pruefen
    // counter zaehlt 
    let counter = 0;
    for (let i = 1; i<=gameData.players[gameData.you].speed; i++) {
        // je nach aktueller bewegungsrichtung
        switch (gameData.players[gameData.you].direction) {
            case "up": 
                if (isLegit(gameData, headZeile, headSpalte-i)) {
                    counter++;
                }
                break;
            case "down": 
                if (isLegit(gameData, headZeile, headSpalte+i)) {
                    counter++;
                } 
                break;
            case "left": 
                if (isLegit(gameData, headZeile+i, headSpalte)) {
                    counter++;
                } 
                break;
            case "right": 
                if (isLegit(gameData, headZeile-i, headSpalte)) {
                    counter++;
                }  
                break;    
        }
    }

    // sind alle benoetigten felder frei?
    if (counter == gameData.players[gameData.you].speed) {
        return true;
    } else {
        return false;
    }
};

/**
 * ist feld existent und frei?
 * @param {number} zeile 
 * @param {number} spalte 
 */
const isLegit = (gameData, zeile, spalte) => {
    // liegen koordinaten im spielfeld und beschreiben ein leeres feld?
    if ((zeile>=0) && (zeile<gameData.height) && (spalte>=0) && (spalte<gameData.width) && (gameData.cells[zeile][spalte]==0)) {
        console.log("[clear]: cell in (row " + zeile + ", column " + spalte + ") is legit");
        return true;
    } else {
        console.log("[clear]: cell in (row " + zeile + ", column " + spalte + ") is illegitimate");
        return false;
    }
};

export { front, right, left};