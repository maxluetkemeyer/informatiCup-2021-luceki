export default class GameData {
    /**
     * creates a gameData Object,
     * given a certain situation and player
     * @param {Array} cells current game round cells array
     * @param {Array} players current player information
     * @param {number} ownNumber own player number for "you" info
     * @param {*} deadline deadline (not sure which Object type yet)
     */
    constructor(cells, players, ownNumber, deadline) {
        this.height = cells.length-1;
        this.width = cells[0].length-1;
        this.cells = cells;
        // worst code in our project, works just fine
        if (players.length == 2) {
            this.players = {
                1: JSON.parse(JSON.stringify(players[0])),
                2: JSON.parse(JSON.stringify(players[1]))
            };
        }
        if (players.length == 3) {
                this.players = {
                    1: JSON.parse(JSON.stringify(players[0])),
                    2: JSON.parse(JSON.stringify(players[1])),
                    3: JSON.parse(JSON.stringify(players[2]))
                };
        }
        if (players.length == 4) {
                this.players = {
                    1: JSON.parse(JSON.stringify(players[0])),
                    2: JSON.parse(JSON.stringify(players[1])),
                    3: JSON.parse(JSON.stringify(players[2])),
                    4: JSON.parse(JSON.stringify(players[3]))
                };
        }
        if (players.length == 5) {
                this.players = {
                    1: JSON.parse(JSON.stringify(players[0])),
                    2: JSON.parse(JSON.stringify(players[1])),
                    3: JSON.parse(JSON.stringify(players[2])),
                    4: JSON.parse(JSON.stringify(players[3])),
                    5: JSON.parse(JSON.stringify(players[4]))
                };
        }
        if (players.length == 6) {
                this.players = {
                    1: JSON.parse(JSON.stringify(players[0])),
                    2: JSON.parse(JSON.stringify(players[1])),
                    3: JSON.parse(JSON.stringify(players[2])),
                    4: JSON.parse(JSON.stringify(players[3])),
                    5: JSON.parse(JSON.stringify(players[4])),
                    6: JSON.parse(JSON.stringify(players[5]))
                };
        }
        this.you = ownNumber;
        this.running = players[ownNumber-1].active;
        this.deadline = deadline;
    }
}