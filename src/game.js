/**
 * Main Game Engine - Canvas platformer game
 */
class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameOver = false;
        this.currentLevel = 0;
        this.levels = [];
        this.currentLevelData = null;
        this.player = null;
        this.enemies = [];
        this.coins = [];
        this.particles = [];
        
        // Physics
        this.gravity = 0.6;
        this.friction = 0.9;
        
        // Input tracking
        this.keys = {};
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === 'r' || e.key === 'R') {
                this.restartLevel();
            }
            if (e.key === ' ') {
                e.preventDefault();
                this.pauseGame();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
    
    async loadLevels(levelDataUrl) {
        try {
            const response = await fetch(levelDataUrl);
            const data = await response.json();
            this.levels = data.levels || data;
        } catch (e) {
            console.error('Failed to load levels:', e);
            // Use default levels if load fails
            this.levels = this.getDefaultLevels();
        }
    }
    
    getDefaultLevels() {
        return [
            this.createLevel1(),
            this.createLevel2(),
            this.createLevel3()
        ];
    }
    
    createLevel1() {
        return {
            id: 1,
            name: "Level 1: Green Meadow",
            width: 800,
            height: 600,
            tileSize: 32,
            player: { x: 50, y: 300 },
            goal: { x: 750, y: 280, width: 30, height: 50 },
            tilemap: [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ],
            enemies: [
                { x: 300, y: 250, type: "goomba", patrolDistance: 150, direction: 1 },
                { x: 500, y: 250, type: "goomba", patrolDistance: 100, direction: -1 }
            ],
            coins: [
                { x: 150, y: 200 },
                { x: 250, y: 150 },
                { x: 350, y: 100 }
            ]
        };
    }
    
    createLevel2() {
        return {
            id: 2,
            name: "Level 2: Mountain Peak",
            width: 800,
            height: 600,
            tileSize: 32,
            player: { x: 50, y: 500 },
            goal: { x: 750, y: 180, width: 30, height: 50 },
            tilemap: [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
                [0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ],
            enemies: [
                { x: 300, y: 200, type: "goomba", patrolDistance: 200, direction: 1 },
                { x: 450, y: 280, type: "goomba", patrolDistance: 150, direction: -1 },
                { x: 600, y: 200, type: "goomba", patrolDistance: 100, direction: 1 }
            ],
            coins: [
                { x: 150, y: 400 },
                { x: 300, y: 250 },
                { x: 400, y: 150 },
                { x: 500, y: 200 },
                { x: 700, y: 350 }
            ]
        };
    }
    
    createLevel3() {
        return {
            id: 3,
            name: "Level 3: Sky Castle",
            width: 800,
            height: 600,
            tileSize: 32,
            player: { x: 50, y: 500 },
            goal: { x: 750, y: 80, width: 30, height: 50 },
            tilemap: [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ],
            hazards: [
                { x: 600, y: 280, width: 32, height: 32 }
            ],
            enemies: [
                { x: 200, y: 300, type: "goomba", patrolDistance: 200, direction: 1 },
                { x: 400, y: 200, type: "goomba", patrolDistance: 150, direction: -1 },
                { x: 550, y: 250, type: "goomba", patrolDistance: 120, direction: 1 },
                { x: 650, y: 200, type: "goomba", patrolDistance: 100, direction: -1 },
                { x: 750, y: 300, type: "goomba", patrolDistance: 150, direction: 1 }
            ],
            coins: [
                { x: 150, y: 400 },
                { x: 280, y: 320 },
                { x: 350, y: 220 },
                { x: 450, y: 150 },
                { x: 500, y: 280 },
                { x: 600, y: 180 },
                { x: 700, y: 250 },
                { x: 750, y: 350 }
            ]
        };
    }
    
    loadLevel(levelIndex) {
        this.currentLevel = levelIndex;
        this.currentLevelData = this.levels[levelIndex];
        this.setupLevel();
    }
    
    setupLevel() {
        const level = this.currentLevelData;
        
        // Reset player
        this.player = new Player(
            level.player.x,
            level.player.y,
            this.gravity,
            level.width,
            level.height
        );
        
        // Setup enemies
        this.enemies = level.enemies.map(e => new Enemy(
            e.x, e.y, e.type, e.patrolDistance, e.direction, level.width, level.height
        ));
        
        // Setup coins
        this.coins = level.coins.map(c => ({
            x: c.x,
            y: c.y,
            collected: false,
            width: 16,
            height: 16
        }));
        
        this.particles = [];
        this.gameOver = false;
    }
    
    update() {
        if (!this.gameRunning || this.gamePaused || this.gameOver) return;
        
        const level = this.currentLevelData;
        
        // Update player
        this.player.update(this.keys, level.tilemap, level.tileSize);
        
        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.update(level.tilemap, level.tileSize);
            
            // Enemy collision with player
            if (this.player.collidesWith(enemy)) {
                if (this.player.velocityY > 0 && this.player.y + this.player.height - 5 < enemy.y + enemy.height / 2) {
                    // Player jumped on enemy
                    enemy.alive = false;
                    this.player.velocityY = -10;
                    this.score += 100;
                } else if (!this.player.invulnerable) {
                    // Player hit by enemy
                    this.player.takeDamage();
                    if (this.player.health <= 0) {
                        this.gameOver = true;
                    }
                }
            }
        });
        
        // Remove dead enemies
        this.enemies = this.enemies.filter(e => e.alive);
        
        // Update coins
        this.coins.forEach(coin => {
            if (!coin.collected && this.player.collidesWith(coin)) {
                coin.collected = true;
                this.score += 10;
            }
        });
        
        // Update particles
        this.particles = this.particles.filter(p => p.life > 0);
        this.particles.forEach(p => p.update());
        
        // Check hazards (Level 3)
        if (level.hazards) {
            level.hazards.forEach(hazard => {
                if (this.player.collidesWith(hazard)) {
                    this.gameOver = true;
                }
            });
        }
        
        // Check goal collision
        if (this.player.collidesWith(level.goal)) {
            this.levelComplete();
        }
        
        // Check falling off map
        if (this.player.y > level.height) {
            this.gameOver = true;
        }
    }
    
    levelComplete() {
        if (this.currentLevel < this.levels.length - 1) {
            this.currentLevel++;
            this.loadLevel(this.currentLevel);
        } else {
            // Game completed!
            this.gameRunning = false;
            this.gameOver = true;
        }
    }
    
    restartLevel() {
        this.loadLevel(this.currentLevel);
    }
    
    pauseGame() {
        this.gamePaused = !this.gamePaused;
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameRunning === false) return;
        
        const level = this.currentLevelData;
        const tileSize = level.tileSize;
        
        // Render tilemap
        for (let row = 0; row < level.tilemap.length; row++) {
            for (let col = 0; col < level.tilemap[row].length; col++) {
                if (level.tilemap[row][col] === 1) {
                    this.ctx.fillStyle = '#228B22';
                    this.ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
                    this.ctx.strokeStyle = '#1a6b1a';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(col * tileSize, row * tileSize, tileSize, tileSize);
                }
            }
        }
        
        // Render hazards (spikes in level 3)
        if (level.hazards) {
            this.ctx.fillStyle = '#ff4444';
            level.hazards.forEach(hazard => {
                this.ctx.fillRect(hazard.x, hazard.y, hazard.width, hazard.height);
                // Draw spike pattern
                this.ctx.strokeStyle = '#cc0000';
                this.ctx.lineWidth = 2;
                for (let i = 0; i < 3; i++) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(hazard.x + (i * 10) + 5, hazard.y);
                    this.ctx.lineTo(hazard.x + (i * 10) + 10, hazard.y + hazard.height);
                    this.ctx.lineTo(hazard.x + (i * 10), hazard.y + hazard.height);
                    this.ctx.closePath();
                    this.ctx.stroke();
                }
            });
        }
        
        // Render coins
        this.coins.forEach(coin => {
            if (!coin.collected) {
                this.ctx.fillStyle = '#FFD700';
                this.ctx.beginPath();
                this.ctx.arc(coin.x + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.strokeStyle = '#FFA500';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        });
        
        // Render goal flag
        const goal = level.goal;
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
        this.ctx.strokeStyle = '#CC0000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(goal.x, goal.y, goal.width, goal.height);
        
        // Render player
        this.player.render(this.ctx);
        
        // Render enemies
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        
        // Render particles
        this.particles.forEach(p => p.render(this.ctx));
        
        // Render HUD
        this.renderHUD();
        
        // Render pause screen
        if (this.gamePaused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 36px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        }
        
        // Render game over screen
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            
            if (this.currentLevel === this.levels.length - 1 && !this.gameRunning) {
                this.ctx.fillText('YOU WON!', this.canvas.width / 2, this.canvas.height / 2 - 50);
            } else {
                this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 50);
            }
            
            this.ctx.font = '24px Arial';
            this.ctx.fillText('Press R to restart level', this.canvas.width / 2, this.canvas.height / 2 + 50);
        }
    }
    
    renderHUD() {
        this.ctx.fillStyle = '#000';
        this.ctx.font = '18px Arial';
        this.ctx.textAlign = 'left';
        
        // Score
        this.ctx.fillText(`Score: ${this.score}`, 10, 25);
        
        // Level
        this.ctx.fillText(`Level: ${this.currentLevel + 1}`, 10, 50);
        
        // Health
        this.ctx.fillText(`Health: ${this.player.health}`, 10, 75);
        
        // Coins collected
        const coinsCollected = this.coins.filter(c => c.collected).length;
        this.ctx.fillText(`Coins: ${coinsCollected}/${this.coins.length}`, 10, 100);
        
        // Controls info
        this.ctx.font = '12px Arial';
        this.ctx.fillText('Arrow Keys/WASD: Move | Space: Jump | R: Restart | Space: Pause', 10, this.canvas.height - 10);
    }
    
    start() {
        this.loadLevel(0);
        const gameLoop = () => {
            this.update();
            this.render();
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }
}

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const game = new Game('gameCanvas');
        game.loadLevels('assets/data/levels.json').then(() => {
            game.start();
        }).catch(() => {
            // Fallback to built-in levels
            game.levels = game.getDefaultLevels();
            game.start();
        });
    });
} else {
    const game = new Game('gameCanvas');
    game.loadLevels('assets/data/levels.json').then(() => {
        game.start();
    }).catch(() => {
        game.levels = game.getDefaultLevels();
        game.start();
    });
}
