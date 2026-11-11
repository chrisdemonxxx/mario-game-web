/* eslint-disable no-unused-vars, no-undef */
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

if (typeof module !== 'undefined' && module.exports) { module.exports = { Game }; }
