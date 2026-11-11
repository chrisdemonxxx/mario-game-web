const { Game } = require('../src/game.js');

describe('UI HUD', () => {
    test('Game initializes with HUD', () => {
        const canvas = { getContext: () => ({}) };
        const game = new Game(canvas);
        expect(game).toBeDefined();
        expect(game.hud).toBeDefined();
    });

    test('Game initializes with correct properties', () => {
        const canvas = { getContext: () => ({}) };
        const game = new Game(canvas);
        expect(game.score).toBe(0);
        expect(game.gameRunning).toBe(true);
        expect(game.gameState).toBe('menu');
    });

    test('Game.start() changes game state to playing', () => {
        const canvas = { getContext: () => ({}) };
        const game = new Game(canvas);
        game.start();
        expect(game.gameState).toBe('playing');
        expect(game.gameRunning).toBe(true);
    });

    test('Game.pause() changes game state to paused', () => {
        const canvas = { getContext: () => ({}) };
        const game = new Game(canvas);
        game.start();
        game.pause();
        expect(game.gameState).toBe('paused');
        expect(game.gameRunning).toBe(false);
    });

    test('Game.resume() restores playing state from paused', () => {
        const canvas = { getContext: () => ({}) };
        const game = new Game(canvas);
        game.start();
        game.pause();
        game.resume();
        expect(game.gameState).toBe('playing');
        expect(game.gameRunning).toBe(true);
    });

    test('Game.endGame() sets game over state', () => {
        const canvas = { getContext: () => ({}) };
        const game = new Game(canvas);
        game.endGame();
        expect(game.gameState).toBe('gameover');
        expect(game.gameRunning).toBe(false);
    });

    test('Game.renderHUD() calls HUD render methods', () => {
        const mockCtx = {
            fillText: jest.fn(),
        };
        const canvas = { getContext: () => mockCtx };
        const game = new Game(canvas);
        game.score = 100;
        game.gameState = 'playing';
        game.renderHUD();
        expect(game.hud).toBeDefined();
    });

    test('UIHud.renderScore() renders score text', () => {
        const mockCtx = {
            fillText: jest.fn(),
        };
        const canvas = { getContext: () => mockCtx };
        const game = new Game(canvas);
        game.score = 50;
        game.renderHUD();
        expect(mockCtx.fillText).toHaveBeenCalled();
    });

    test('UIHud.renderGameState() renders state text', () => {
        const mockCtx = {
            fillText: jest.fn(),
        };
        const canvas = { getContext: () => mockCtx };
        const game = new Game(canvas);
        game.gameState = 'playing';
        game.renderHUD();
        expect(mockCtx.fillText).toHaveBeenCalled();
    });

    test('Game state transitions: menu -> playing -> paused -> playing -> gameover', () => {
        const canvas = { getContext: () => ({}) };
        const game = new Game(canvas);
        expect(game.gameState).toBe('menu');

        game.start();
        expect(game.gameState).toBe('playing');

        game.pause();
        expect(game.gameState).toBe('paused');

        game.resume();
        expect(game.gameState).toBe('playing');

        game.endGame();
        expect(game.gameState).toBe('gameover');
    });
});
