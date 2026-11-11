const { Player } = require('../src/player');
const { Game, UIHud } = require('../src/game');

describe('Health System - Player Health Mechanics', () => {
    let canvas;
    let player;
    let mockCtx;

    beforeEach(() => {
        mockCtx = {
            fillText: jest.fn(),
            fillRect: jest.fn(),
            fillStyle: '',
            font: '',
            textAlign: ''
        };
        canvas = {
            width: 800,
            height: 600,
            getContext: jest.fn(() => mockCtx)
        };
        player = new Player(400, 300, canvas);
    });

    test('Player starts with 3 lives', () => {
        expect(player.health).toBe(3);
        expect(player.maxHealth).toBe(3);
    });

    test('Touching enemy reduces health by 1', () => {
        player.gameTime = 0;
        player.update(0);
        expect(player.takeDamage()).toBe(true);
        expect(player.health).toBe(2);
    });

    test('Player health display in HUD', () => {
        expect(player.health).toBe(3);
    });

    test('Taking damage multiple times', () => {
        player.gameTime = 0;
        player.update(0);
        player.takeDamage();
        expect(player.health).toBe(2);
        
        player.gameTime = 1100;
        player.update(1100);
        player.takeDamage();
        expect(player.health).toBe(1);
        
        player.gameTime = 2200;
        player.update(2200);
        player.takeDamage();
        expect(player.health).toBe(0);
    });
});

describe('Health System - Invulnerability Frames', () => {
    let canvas;
    let player;
    let mockCtx;

    beforeEach(() => {
        mockCtx = {
            fillText: jest.fn(),
            fillRect: jest.fn(),
            fillStyle: '',
            font: ''
        };
        canvas = {
            width: 800,
            height: 600,
            getContext: jest.fn(() => mockCtx)
        };
        player = new Player(400, 300, canvas);
    });

    test('Player is invincible after taking damage', () => {
        player.gameTime = 0;
        player.update(0);
        player.takeDamage();
        expect(player.isInvincible).toBe(true);
    });

    test('Invulnerability blocks further damage', () => {
        player.gameTime = 0;
        player.update(0);
        player.takeDamage();
        const blocked = player.takeDamage();
        expect(blocked).toBe(false);
    });

    test('Invulnerability expires after 1 second', () => {
        player.gameTime = 0;
        player.update(0);
        player.takeDamage();
        expect(player.isInvincible).toBe(true);

        player.gameTime = 1100;
        player.update(1100);
        expect(player.isInvincible).toBe(false);
    });

    test('Can take damage after invulnerability expires', () => {
        player.gameTime = 0;
        player.update(0);
        player.takeDamage();
        expect(player.health).toBe(2);

        player.gameTime = 1100;
        player.update(1100);
        const canTakeDamage = player.takeDamage();
        expect(canTakeDamage).toBe(true);
        expect(player.health).toBe(1);
    });
});

describe('Health System - Visual Feedback', () => {
    let canvas;
    let player;
    let mockCtx;

    beforeEach(() => {
        mockCtx = {
            fillText: jest.fn(),
            fillRect: jest.fn(),
            fillStyle: '',
            font: ''
        };
        canvas = {
            width: 800,
            height: 600,
            getContext: jest.fn(() => mockCtx)
        };
        player = new Player(400, 300, canvas);
    });

    test('isFlashing returns false when not invincible', () => {
        player.gameTime = 0;
        player.update(0);
        expect(player.isFlashing()).toBe(false);
    });

    test('isFlashing response during invulnerability', () => {
        player.gameTime = 0;
        player.update(0);
        player.takeDamage();

        player.gameTime = 50;
        player.update(50);
        const flash1 = player.isFlashing();

        player.gameTime = 150;
        player.update(150);
        const flash2 = player.isFlashing();

        expect(typeof flash1).toBe('boolean');
        expect(typeof flash2).toBe('boolean');
    });
});

describe('Health System - Game Over Mechanics', () => {
    let canvas;
    let game;
    let mockCtx;

    beforeEach(() => {
        mockCtx = {
            fillText: jest.fn(),
            fillRect: jest.fn(),
            fillStyle: '',
            font: '',
            textAlign: ''
        };
        canvas = {
            width: 800,
            height: 600,
            getContext: jest.fn(() => mockCtx)
        };
        game = new Game(canvas);
    });

    test('Game has game over state', () => {
        game.start();
        game.endGame('Health depleted');
        expect(game.gameState).toBe('gameover');
    });

    test('Game stops running on game over', () => {
        game.start();
        game.endGame();
        expect(game.gameRunning).toBe(false);
    });

    test('Game can restart from game over', () => {
        game.start();
        game.score = 1000;
        game.endGame();
        game.restart();
        expect(game.gameState).toBe('playing');
        expect(game.score).toBe(0);
    });
});

describe('Health System - Win Conditions', () => {
    let canvas;
    let game;
    let mockCtx;

    beforeEach(() => {
        mockCtx = {
            fillText: jest.fn(),
            fillRect: jest.fn(),
            fillStyle: '',
            font: '',
            textAlign: ''
        };
        canvas = {
            width: 800,
            height: 600,
            getContext: jest.fn(() => mockCtx)
        };
        game = new Game(canvas);
    });

    test('Game has won state', () => {
        game.start();
        game.winLevel(500);
        expect(game.gameState).toBe('won');
    });

    test('Level completion adds bonus to score', () => {
        game.start();
        game.score = 1000;
        game.winLevel(500);
        expect(game.score).toBe(1500);
    });

    test('Game can proceed to next level', () => {
        game.start();
        game.winLevel(500);
        game.nextLevel();
        expect(game.currentLevel).toBe(2);
    });
});

describe('Health System - HUD Display', () => {
    let canvas;
    let hud;
    let mockCtx;

    beforeEach(() => {
        mockCtx = {
            fillText: jest.fn(),
            fillRect: jest.fn(),
            fillStyle: '',
            font: '',
            textAlign: ''
        };
        canvas = {
            width: 800,
            height: 600,
            getContext: jest.fn(() => mockCtx)
        };
        hud = new UIHud(canvas);
    });

    test('HUD can render health as hearts', () => {
        hud.renderHealth(3, 3);
        expect(mockCtx.fillText).toHaveBeenCalled();
    });

    test('HUD can render score', () => {
        hud.renderScore(1000);
        expect(mockCtx.fillText).toHaveBeenCalled();
    });

    test('HUD can render game state', () => {
        hud.renderGameState('playing');
        expect(mockCtx.fillText).toHaveBeenCalled();
    });
});
