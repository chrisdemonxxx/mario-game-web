/* global module, Player, Enemy */
/**
 * Main Game Engine - Canvas platformer game
 */
// eslint-disable-next-line no-unused-vars
class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.gameRunning = true;
        this.gamePaused = false;
        this.player = null;
        this.enemies = [];
        this.collectibles = [];
        this.levelManager = null;
        this.currentTilemap = [];
        this.gameLoopId = null;
    }
    
    loadLevels(filePath) {
        return fetch(filePath).then(res => res.json()).then(data => {
            this.levels = data;
            this.levelManager = new LevelManager();
            this.levelManager.loadLevels(this.levels);
            this.initLevel(0);
        });
    }
    
    getDefaultLevels() {
        return [
            {
                tilemap: [
                    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0],
                    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
                ],
                enemies: [{x: 100, y: 200, type: 'goomba', patrolDistance: 200, direction: 1}],
                collectibles: [{x: 200, y: 100}, {x: 300, y: 150}]
            }
        ];
    }
    
    initLevel(levelIndex) {
        const level = this.levels[levelIndex];
        this.currentTilemap = level.tilemap;
        this.player = new Player(50, 300, 0.6, 800, 600);
        this.enemies = level.enemies.map(e => new Enemy(e.x, e.y, e.type, e.patrolDistance, e.direction, 800, 600));
        this.collectibles = level.collectibles;
        this.score = 0;
    }
    
    update() {
        if (!this.gameRunning || this.gamePaused) return;
        this.player.update(this.keys || {}, this.currentTilemap, 32);
        this.enemies.forEach(e => e.update(this.currentTilemap, 32));
        this.enemies.forEach(e => {
            if (this.player.collidesWith(e)) {
                this.player.takeDamage();
                if (this.player.health <= 0) this.gameRunning = false;
            }
        });
        this.collectibles = this.collectibles.filter(c => {
            if (this.player.collidesWith(c)) {
                this.score += 10;
                return false;
            }
            return true;
        });
    }
    
    render() {
        const tileSize = 32;
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, 800, 600);
        for (let row = 0; row < this.currentTilemap.length; row++) {
            for (let col = 0; col < this.currentTilemap[row].length; col++) {
                if (this.currentTilemap[row][col] === 1) {
                    this.ctx.fillStyle = '#8B4513';
                    this.ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
                }
            }
        }
        this.collectibles.forEach(c => {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.arc(c.x, c.y, 5, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.enemies.forEach(e => e.render(this.ctx));
        this.player.render(this.ctx);
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 10, 20);
        this.ctx.fillText(`Health: ${this.player.health}/${this.player.maxHealth}`, 10, 40);
    }
    
    start() {
        this.keys = {};
        document.addEventListener('keydown', (e) => { this.keys[e.key] = true; });
        document.addEventListener('keyup', (e) => { this.keys[e.key] = false; });
        this.gameLoopId = setInterval(() => {
            this.update();
            this.render();
        }, 1000 / 60);
    }
    
    stop() {
        if (this.gameLoopId) clearInterval(this.gameLoopId);
        this.gameRunning = false;
    }
}

if (typeof module !== 'undefined' && module.exports) { module.exports = Game; }

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            const game = new Game('gameCanvas');
            game.loadLevels('assets/data/levels.json').then(() => {
                game.start();
            }).catch(() => {
                game.levels = game.getDefaultLevels();
                game.initLevel(0);
                game.start();
            });
        });
    } else {
        const game = new Game('gameCanvas');
        game.loadLevels('assets/data/levels.json').then(() => {
            game.start();
        }).catch(() => {
            game.levels = game.getDefaultLevels();
            game.initLevel(0);
            game.start();
        });
    }
}