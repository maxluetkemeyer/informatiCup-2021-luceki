export default class GameDataArray {
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
        this.players = players;
        this.you = ownNumber;
        this.running = players[ownNumber-1].active;
        this.deadline = deadline;
    }
}