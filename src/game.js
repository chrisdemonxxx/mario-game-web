/* eslint-disable no-unused-vars */
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.score = 0;
        this.gameRunning = true;
    }

    start() {
        console.log('Game started');
    }
}
