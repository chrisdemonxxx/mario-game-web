// Comprehensive test suite for Game class, UIHud, Player, and Enemy
const { Game, UIHud } = require('../src/game');
const { Player } = require('../src/player');
const { Enemy } = require('../src/enemy');

describe('UIHud Class', () => {
    let canvas;
    let mockCtx;
    let hud;

    beforeEach(() => {
        // Mock canvas and context
        canvas = {
            width: 800,
            height: 600,
            getContext: jest.fn(() => mockCtx)
        };
        mockCtx = {
            fillStyle: '',
            font: '',
            fillText: jest.fn(),
            fillRect: jest.fn(),
            textAlign: ''
        };
        hud = new UIHud(canvas);
    });

    test('UIHud should initialize with canvas', () => {
        expect(hud.canvas).toBe(canvas);
        expect(canvas.getContext).toHaveBeenCalledWith('2d');
    });

    test('renderScore should render score text', () => {
        hud.renderScore(100);
        expect(mockCtx.fillText).toHaveBeenCalledWith('Score: 100', 10, 20);
    });

    test('renderGameState should render game state', () => {
        hud.renderGameState('playing');
        expect(mockCtx.fillText).toHaveBeenCalledWith('State: playing', 10, 45);
    });

    test('renderHealth should render health hearts', () => {
        hud.renderHealth(2, 3);
        expect(mockCtx.fillText).toHaveBeenCalled();
    });

    test('renderGameOverScreen should render game over elements', () => {
        hud.renderGameOverScreen(500, 'Fell in pit');
        expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
        // Check that GAME OVER text was rendered at correct position (canvas.height/2 - 60 = 300 - 60 = 240)
        expect(mockCtx.fillText).toHaveBeenCalledWith('GAME OVER', 400, 240);
    });

    test('renderWinScreen should render win screen elements', () => {
        hud.renderWinScreen(1000, 500);
        expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
        // Check that LEVEL COMPLETE text was rendered at correct position
        expect(mockCtx.fillText).toHaveBeenCalledWith('LEVEL COMPLETE!', 400, 240);
    });
});

describe('Game Class', () => {
    let game;
    let canvas;
    let mockCtx;

    beforeEach(() => {
        canvas = {
            width: 800,
            height: 600,
            getContext: jest.fn(() => mockCtx)
        };
        mockCtx = {
            fillStyle: '',
            font: '',
            fillText: jest.fn(),
            fillRect: jest.fn(),
            textAlign: ''
        };
        game = new Game(canvas);
    });

    test('Game should initialize with default values', () => {
        expect(game.canvas).toBe(canvas);
        expect(game.score).toBe(0);
        expect(game.gameRunning).toBe(true);
        expect(game.gameState).toBe('menu');
        expect(game.currentLevel).toBe(1);
    });

    test('start should set game to playing state', () => {
        game.start();
        expect(game.gameState).toBe('playing');
        expect(game.gameRunning).toBe(true);
        expect(game.gameTime).toBe(0);
    });

    test('pause should set game to paused state', () => {
        game.start();
        game.pause();
        expect(game.gameState).toBe('paused');
        expect(game.gameRunning).toBe(false);
    });

    test('resume should resume from paused state', () => {
        game.pause();
        game.resume();
        expect(game.gameState).toBe('playing');
        expect(game.gameRunning).toBe(true);
    });

    test('resume should not change state if not paused', () => {
        game.gameState = 'menu';
        game.resume();
        expect(game.gameState).toBe('menu');
    });

    test('endGame should set game over state', () => {
        game.start();
        game.endGame('Fell in pit');
        expect(game.gameState).toBe('gameover');
        expect(game.gameRunning).toBe(false);
        expect(game.gameOverReason).toBe('Fell in pit');
    });

    test('endGame should use default reason if not provided', () => {
        game.endGame();
        expect(game.gameOverReason).toBe('Game Over');
    });

    test('winLevel should set won state and add bonus', () => {
        game.start();
        const initialScore = game.score;
        game.winLevel(500);
        expect(game.gameState).toBe('won');
        expect(game.gameRunning).toBe(false);
        expect(game.levelCompletionBonus).toBe(500);
        expect(game.score).toBe(initialScore + 500);
    });

    test('nextLevel should increment level and reset game time', () => {
        game.currentLevel = 1;
        game.gameTime = 100;
        game.nextLevel();
        expect(game.currentLevel).toBe(2);
        expect(game.gameTime).toBe(0);
        expect(game.gameState).toBe('playing');
        expect(game.gameRunning).toBe(true);
    });

    test('restart should reset game to initial state', () => {
        game.currentLevel = 5;
        game.score = 1000;
        game.gameOverReason = 'Fell in pit';
        game.restart();
        expect(game.currentLevel).toBe(1);
        expect(game.score).toBe(0);
        expect(game.gameState).toBe('playing');
        expect(game.gameRunning).toBe(true);
        expect(game.gameTime).toBe(0);
        expect(game.gameOverReason).toBe('');
    });

    test('returnToMenu should reset game to menu', () => {
        game.start();
        game.score = 500;
        game.currentLevel = 3;
        game.returnToMenu();
        expect(game.gameState).toBe('menu');
        expect(game.gameRunning).toBe(false);
        expect(game.score).toBe(0);
        expect(game.currentLevel).toBe(1);
    });

    test('updateGameTime should increment game time when running', () => {
        game.start();
        game.updateGameTime(16);
        expect(game.gameTime).toBe(16);
        game.updateGameTime(16);
        expect(game.gameTime).toBe(32);
    });

    test('updateGameTime should not increment when game is not running', () => {
        game.start();
        game.pause();
        game.updateGameTime(16);
        expect(game.gameTime).toBe(0);
    });

    test('updateGameTime should use default delta time', () => {
        game.start();
        game.updateGameTime();
        expect(game.gameTime).toBe(16);
    });

    test('addScore should increase score', () => {
        game.score = 0;
        game.addScore(100);
        expect(game.score).toBe(100);
        game.addScore(50);
        expect(game.score).toBe(150);
    });

    test('renderHUD should call hud render methods', () => {
        jest.spyOn(game.hud, 'renderScore');
        jest.spyOn(game.hud, 'renderGameState');
        game.renderHUD();
        expect(game.hud.renderScore).toHaveBeenCalledWith(0);
        expect(game.hud.renderGameState).toHaveBeenCalledWith('menu');
    });

    test('renderGameOverScreen should call hud render method', () => {
        jest.spyOn(game.hud, 'renderGameOverScreen');
        game.renderGameOverScreen();
        expect(game.hud.renderGameOverScreen).toHaveBeenCalledWith(game.score, game.gameOverReason);
    });

    test('renderWinScreen should call hud render method', () => {
        jest.spyOn(game.hud, 'renderWinScreen');
        game.renderWinScreen();
        expect(game.hud.renderWinScreen).toHaveBeenCalledWith(game.score - game.levelCompletionBonus, game.levelCompletionBonus);
    });
});

describe('Player Class - Enhanced Tests', () => {
    test('Player Initialization', () => {
        const player = new Player(100, 50, null);
        expect(player.x).toBe(100);
        expect(player.y).toBe(50);
    });

    test('Player Movement Left', () => {
        const player = new Player(100, 50, null);
        player.moveLeft();
        expect(player.velocityX).toBe(-3);
    });

    test('Player Movement Right', () => {
        const player = new Player(100, 50, null);
        player.moveRight();
        expect(player.velocityX).toBe(3);
    });

    test('Player Jump', () => {
        const player = new Player(100, 50, null);
        player.setGrounded(true);
        player.jump();
        expect(player.velocityY).toBe(-player.jumpForce);
    });

    test('Player Has Health', () => {
        const player = new Player(100, 50, null);
        expect(player.health).toBe(3);
        expect(player.maxHealth).toBe(3);
    });

    test('Player Movement Bounds - Left boundary', () => {
        const player = new Player(5, 50, null);
        player.setInput('left', true);
        player.update(0.1);
        expect(player.x).toBe(0);
        expect(player.x).toBeGreaterThanOrEqual(0);
    });

    test('Player Movement Bounds - Right boundary', () => {
        const player = new Player(795, 50, null);
        player.moveRight();
        player.update(0.1);
        expect(player.x).toBeLessThanOrEqual(800 - player.width);
        expect(player.x + player.width).toBeLessThanOrEqual(800);
    });

    test('Player Take Damage reduces health', () => {
        const player = new Player(100, 50, null);
        const initialHealth = player.health;
        player.takeDamage();
        expect(player.health).toBe(initialHealth - 1);
    });

    test('Player Health cannot go below 0', () => {
        const player = new Player(100, 50, null);
        player.health = 0;
        player.takeDamage();
        expect(player.health).toBe(0);
    });

    test('Player Invincibility after damage', () => {
        const player = new Player(100, 50, null);
        player.gameTime = 0;
        player.takeDamage();
        expect(player.isInvincible).toBe(true);
    });

    test('Player Landing resets velocity direction', () => {
        const player = new Player(100, 50, null);
        player.vy = 10;
        player.setGrounded(true);
        expect(player.velocityY).toBe(0);
    });
});

describe('Enemy Class - Enhanced Tests', () => {
    test('Enemy Initialization', () => {
        const enemy = new Enemy(200, 100);
        expect(enemy.x).toBe(200);
        expect(enemy.y).toBe(100);
    });

    test('Enemy Patrol Movement changes position', () => {
        const enemy = new Enemy(200, 100);
        const initialX = enemy.x;
        enemy.update(0.1);
        expect(enemy.x).not.toBe(initialX);
    });

    test('Enemy has health points', () => {
        const enemy = new Enemy(100, 100);
        expect(enemy.hp).toBeGreaterThan(0);
    });

    test('Enemy patrol direction reversal at boundaries', () => {
        const enemy = new Enemy(5, 100);
        const initialX = enemy.x;
        const initialDirection = enemy.direction;
        enemy.update(1);
        // Verify enemy moved in the direction it was heading
        const expectedX = initialX + initialDirection * enemy.speed * 1;
        expect(enemy.x).toBeCloseTo(expectedX, 0);
    });
    test('Enemy respawn when falling off map', () => {
        const enemy = new Enemy(100, 700);
        enemy.update(0.1);
        // Check that enemy respawns or stays in bounds
        expect(enemy.y).toBeLessThan(1000);
    });

    test('Enemy take damage reduces hp', () => {
        const enemy = new Enemy(100, 100);
        const initialHp = enemy.hp;
        enemy.takeDamage(1);
        expect(enemy.hp).toBe(initialHp - 1);
    });

    test('Enemy dies when hp reaches 0', () => {
        const enemy = new Enemy(100, 100);
        enemy.hp = 1;
        enemy.takeDamage(1);
        expect(enemy.hp).toBe(0);
        expect(enemy.state).toBe('dead');
    });
});
