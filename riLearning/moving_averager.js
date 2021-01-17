/* eslint-disable require-jsdoc */
export default class MovingAverager {
    constructor(bufferLength) {
      this.buffer = [];
      for (let i = 0; i < bufferLength; ++i) {
        this.buffer.push(null);
      }
    }
  
    append(x) {
      this.buffer.shift();
      this.buffer.push(x);
    }
  
    average() {
      return this.buffer.reduce((x, prev) => x + prev) / this.buffer.length;
    } 
}