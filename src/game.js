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

    collectCoin() {
        this.score += 10;
    }

    completeLevel() {
        this.score += 500;
    }

    nextLevel() {
        // Score persists
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Game };
}
