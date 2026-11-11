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

        // Render hearts
        for (let i = 0; i < maxHealth; i++) {
            const x = 80 + (i * 20);
            const y = 55;
            if (i < health) {
                this.ctx.fillStyle = '#FF0000'; // Red heart
                this.ctx.fillText('❤', x, y);
            } else {
                this.ctx.fillStyle = '#CCCCCC'; // Gray empty heart
                this.ctx.fillText('♡', x, y);
            }
        }
    }

    renderGameOverScreen(score, reason) {
        // Darken background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Game Over text
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 60);

        // Final score
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Final Score: ${score}`, this.canvas.width / 2, this.canvas.height / 2);

        // Reason
        this.ctx.font = '16px Arial';
        this.ctx.fillText(reason, this.canvas.width / 2, this.canvas.height / 2 + 40);

        // Options
        this.ctx.font = '14px Arial';
        this.ctx.fillText('Press R to Restart | Press M for Menu', this.canvas.width / 2, this.canvas.height / 2 + 80);

        this.ctx.textAlign = 'left';
    }

    renderWinScreen(score, levelBonus) {
        // Darken background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Level Complete text
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('LEVEL COMPLETE!', this.canvas.width / 2, this.canvas.height / 2 - 60);

        // Score and bonus
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Score: ${score}`, this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillText(`Bonus: +${levelBonus}`, this.canvas.width / 2, this.canvas.height / 2 + 40);

        // Options
        this.ctx.font = '14px Arial';
        this.ctx.fillText('Press SPACE for Next Level | Press M for Menu', this.canvas.width / 2, this.canvas.height / 2 + 100);

        this.ctx.textAlign = 'left';
    }
}

// eslint-disable-next-line no-unused-vars
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.score = 0;
        this.gameRunning = true;
        this.gameState = 'menu'; // menu, playing, paused, gameover, won
        this.hud = new UIHud(canvas);
        this.currentLevel = 1;
        this.gameOverReason = '';
        this.levelCompletionBonus = 0;
        this.gameTime = 0;
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

    returnToMenu() {
        this.gameState = 'menu';
        this.gameRunning = false;
        this.score = 0;
        this.currentLevel = 1;
    }

    updateGameTime(deltaTime) {
        if (this.gameRunning) {
            this.gameTime += deltaTime || 16; // Default 16ms for ~60fps
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
}

// eslint-disable-next-line no-undef
if (typeof module !== 'undefined' && module.exports) {
    // eslint-disable-next-line no-undef
    module.exports = { Game, UIHud };
}

// Export for Jest (CommonJS) while staying usable as a plain <script> in the browser.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Game, UIHud };
}
