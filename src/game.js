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

// Export for Jest (CommonJS) while staying usable as a plain <script> in the browser.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Game };
}
