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

/* eslint-disable-next-line no-undef */
if (typeof module !== 'undefined' && module.exports) {
    /* eslint-disable-next-line no-undef */
    module.exports = { Game };
}
