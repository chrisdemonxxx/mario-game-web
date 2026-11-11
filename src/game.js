class UIHud {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    renderScore(score) {
        this.ctx.fillStyle = '#000';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Score: ${score}`, 10, 20);
    }

    renderGameState(state) {
        this.ctx.fillStyle = '#000';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`State: ${state}`, 10, 45);
    }
}

// eslint-disable-next-line no-unused-vars
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.score = 0;
        this.gameRunning = true;
        this.gameState = 'menu'; // menu, playing, paused, gameover
        this.hud = new UIHud(canvas);
    }

    start() {
        this.gameState = 'playing';
        this.gameRunning = true;
        console.log('Game started');
    }

    pause() {
        this.gameState = 'paused';
        this.gameRunning = false;
    }

    resume() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.gameRunning = true;
        }
    }

    endGame() {
        this.gameState = 'gameover';
        this.gameRunning = false;
    }

    renderHUD() {
        this.hud.renderScore(this.score);
        this.hud.renderGameState(this.gameState);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Game, UIHud };
}
