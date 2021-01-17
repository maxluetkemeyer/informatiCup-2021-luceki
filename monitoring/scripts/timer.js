/* eslint-disable no-unused-vars */
class Timer{
    /**
     * Constructor for Timer
     * @param {div} element Timer Element
     * @param {number} updateMs how often the timer should update
     * @param {boolean} inMs show timer in ms?
     */
    constructor(element, updateMs, inMs){
        this.timerDisplay = element;
        this.updateMs = updateMs;
        this.inMs = inMs;

        this.startTime;
        this.updatedTime;
        this.difference;
        this.savedTime;
        this.paused;
        this.timerRunning;
        this.minutes;
        this.seconds;
        this.milliseconds;

        this.tInterval;
    }

    /**
     * Starts the timer
     */
    startTimer(){
        if(!this.timerRunning){
          this.startTime = new Date().getTime();
          //============================================== .bind(this) YEAHHH
          this.tInterval = setInterval(this.getShowTime.bind(this), this.updateMs);
          // change 1 to 1000 above to run script every second instead of every millisecond. one other change will be needed in the getShowTime() function below for this to work. see comment there.   
       
          this.paused = 0;
          this.timerRunning = 1;
        }
    }

    /**
     * Pauses the timer
     */
    pauseTimer(){
        clearInterval(this.tInterval);
        this.paused = 1;
        this.timerRunning = 0;
    }
    
    /**
     * Stops the timer and resets it to zero.
     */
    resetTimer(){
        clearInterval(this.tInterval);
        this.savedTime = 0;
        this.difference = 0;
        this.paused = 0;
        this.timerRunning = 0;
    }

    /**
     * Updates the time in the timer element
     */
    getShowTime(){
        this.updatedTime = new Date().getTime();

        this.difference =  this.updatedTime - this.startTime;
        
        // var days = Math.floor(difference / (1000 * 60 * 60 * 24));
        //var hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        this.minutes = Math.floor((this.difference % (1000 * 60 * 60)) / (1000 * 60));
        this.seconds = Math.floor((this.difference % (1000 * 60)) / 1000);
        this.milliseconds = Math.floor((this.difference % (1000 * 60)) / 10);
        //hours = (hours < 10) ? "0" + hours : hours;
        this.minutes = (this.minutes < 10) ? "0" + this.minutes : this.minutes;
        this.seconds = (this.seconds < 10) ? "0" + this.seconds : this.seconds;
        //this.milliseconds = (this.milliseconds < 100) ? (this.milliseconds < 10) ? "00" + this.milliseconds : "0" + this.milliseconds : this.milliseconds;

        this.milliseconds = this.milliseconds % 100;
        this.milliseconds = (this.milliseconds < 10) ? "0"+this.milliseconds : this.milliseconds;

        if(this.inMs){
            this.timerDisplay.innerHTML = this.seconds + ":" + this.milliseconds;
        }else {
            this.timerDisplay.innerHTML = this.minutes + ":" + this.seconds;
        }
        
    }

    /**
     * Returns the current time
     */
    getTime(){
        return this.updatedTime-this.startTime;
    }
}