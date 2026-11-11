class HealthSystem {
    constructor(maxHealth = 100) {
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        this.isAlive = true;
    }

    takeDamage(amount) {
        this.currentHealth = Math.max(0, this.currentHealth - amount);
        if (this.currentHealth <= 0) {
            this.isAlive = false;
        }
        return this.isAlive;
    }

    heal(amount) {
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
    }

    reset() {
        this.currentHealth = this.maxHealth;
        this.isAlive = true;
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
        this.health = new HealthSystem(100);
    }

    start() {
        this.gameState = 'playing';
        this.gameRunning = true;
        this.health.reset();
        console.log('Game started');
    }

    takeDamage(amount) {
        const isAlive = this.health.takeDamage(amount);
        if (!isAlive) {
            this.endGame();
        }
        return isAlive;
    }

    endGame() {
        this.gameState = 'gameover';
        this.gameRunning = false;
    }

    winGame() {
        this.gameState = 'win';
        this.gameRunning = false;
    }
}

// eslint-disable-next-line no-undef
const gameExports = { Game, HealthSystem };
/* eslint-disable-next-line no-undef */
typeof module !== 'undefined' && module.exports && (module.exports = gameExports);