export default class Player {
    /**
     * creates a player instance,
     * initiliazes position, direction, speed and status
     * @param {Array} pos initial palyer position 
     * @param {string} dir initial palyer direction
     */
    constructor(pos, dir) {
        this.x = pos[0];
        this.y = pos[1];
        this.direction = dir;
        this.speed = 1;
        this.active = true;
    }
}