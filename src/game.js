// eslint-disable-next-line no-unused-vars
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.score = 0;
        this.gameRunning = true;
        this.currentLevel = 0;
    }

    start() {
        console.log('Game started');
    }

    collectCoin() {
        this.score += 10;
    }

    completeLevel() {
        this.score += 100;
    }

    nextLevel() {
        this.currentLevel++;
    }
}

// Export for Jest (CommonJS) while staying usable as a plain <script> in the browser.
// eslint-disable-next-line no-undef
if (typeof module !== 'undefined' && module.exports) {
    // eslint-disable-next-line no-undef
    module.exports = { Game };
}