// eslint-disable-next-line no-unused-vars
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

    renderHealth(health, maxHealth) {
        this.ctx.fillStyle = '#000';
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Health: ', 10, 70);
        for (let i = 0; i < maxHealth; i++) {
            if (i < health) {
                this.ctx.fillStyle = '#f00';
            } else {
                this.ctx.fillStyle = '#999';
            }
            this.ctx.fillRect(75 + i * 20, 60, 15, 15);
        }
    }

    renderLevel(levelNumber, totalLevels) {
        this.ctx.fillStyle = '#000';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Level: ${levelNumber}/${totalLevels}`, 10, 95);
    }

    renderRestartHint() {
        this.ctx.fillStyle = '#666';
        this.ctx.font = '12px Arial';
        this.ctx.fillText('(Press R to restart)', 10, 115);
    }

    renderGameOverScreen(score, reason) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '32px Arial';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2 - 120, this.canvas.height / 2 - 20);
        this.ctx.font = '18px Arial';
        this.ctx.fillText(`Reason: ${reason}`, this.canvas.width / 2 - 80, this.canvas.height / 2 + 20);
        this.ctx.fillText(`Final Score: ${score}`, this.canvas.width / 2 - 100, this.canvas.height / 2 + 60);
    }

    renderWinScreen(score, levelBonus) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#0f0';
        this.ctx.font = '32px Arial';
        this.ctx.fillText('LEVEL WON!', this.canvas.width / 2 - 130, this.canvas.height / 2 - 20);
        this.ctx.font = '18px Arial';
        this.ctx.fillText(`Base Score: ${score}`, this.canvas.width / 2 - 100, this.canvas.height / 2 + 20);
        this.ctx.fillText(`Bonus: +${levelBonus}`, this.canvas.width / 2 - 80, this.canvas.height / 2 + 60);
    }
}

// eslint-disable-next-line no-unused-vars
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.score = 0;
        this.gameRunning = true;
        this.gameState = 'menu';
        this.hud = new UIHud(canvas);
        this.currentLevel = 1;
        this.gameOverReason = '';
        this.levelCompletionBonus = 0;
        this.gameTime = 0;
        this.setupKeyboardControls();
    }

    start() {
        this.gameState = 'playing';
        this.gameRunning = true;
        this.gameTime = 0;
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

    endGame(reason) {
        this.gameState = 'gameover';
        this.gameRunning = false;
        this.gameOverReason = reason || 'Game Over';
    }

    winLevel(levelBonus) {
        this.gameState = 'won';
        this.gameRunning = false;
        this.levelCompletionBonus = levelBonus || 0;
        this.score += this.levelCompletionBonus;
    }

    nextLevel() {
        this.currentLevel += 1;
        this.gameState = 'playing';
        this.gameRunning = true;
        this.gameTime = 0;
    }

    restart() {
        this.currentLevel = 1;
        this.score = 0;
        this.gameState = 'playing';
        this.gameRunning = true;
        this.gameTime = 0;
        this.gameOverReason = '';
    }

    restartLevel() {
        this.gameState = 'playing';
        this.gameRunning = true;
        this.gameTime = 0;
    }

    returnToMenu() {
        this.gameState = 'menu';
        this.gameRunning = false;
        this.score = 0;
        this.currentLevel = 1;
    }

    updateGameTime(deltaTime) {
        if (this.gameRunning) {
            this.gameTime += deltaTime || 16;
        }
    }

    renderHUD() {
        this.hud.renderScore(this.score);
        this.hud.renderGameState(this.gameState);
    }

    renderGameOverScreen() {
        this.hud.renderGameOverScreen(this.score, this.gameOverReason);
    }

    renderWinScreen() {
        this.hud.renderWinScreen(this.score - this.levelCompletionBonus, this.levelCompletionBonus);
    }

    addScore(points) {
        this.score += points;
    }

    // Setup keyboard controls (R-key for restart)
    setupKeyboardControls() {
        const keydownHandler = (event) => {
            if (event.key === 'r' || event.key === 'R') {
                this.restartLevel();
            }
        };
        
        if (typeof window !== 'undefined') {
            window.addEventListener('keydown', keydownHandler);
        }
    }
}

// eslint-disable-next-line no-undef
if (typeof module !== 'undefined' && module.exports) {
    // eslint-disable-next-line no-undef
    module.exports = { Game, UIHud };
}
