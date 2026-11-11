describe('UI HUD', () => {
    let canvas;
    let game;

    beforeEach(() => {
        canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        game = new Game(canvas);
    });

    test('Game initializes with HUD', () => {
        expect(game).toBeDefined();
        expect(game.hud).toBeDefined();
        expect(game.gameState).toBe('menu');
    });

    test('Game initializes with correct properties', () => {
        expect(game.score).toBe(0);
        expect(game.gameRunning).toBe(true);
        expect(game.canvas).toBe(canvas);
    });

    test('Game.start() changes game state to playing', () => {
        game.start();
        expect(game.gameState).toBe('playing');
        expect(game.gameRunning).toBe(true);
    });

    test('Game.pause() changes game state to paused', () => {
        game.start();
        game.pause();
        expect(game.gameState).toBe('paused');
        expect(game.gameRunning).toBe(false);
    });

    test('Game.resume() restores playing state from paused', () => {
        game.start();
        game.pause();
        game.resume();
        expect(game.gameState).toBe('playing');
        expect(game.gameRunning).toBe(true);
    });

    test('Game.endGame() sets game over state', () => {
        game.start();
        game.endGame();
        expect(game.gameState).toBe('gameover');
        expect(game.gameRunning).toBe(false);
    });

    test('Game.renderHUD() calls HUD render methods', () => {
        const spy1 = jest.spyOn(game.hud, 'renderScore');
        const spy2 = jest.spyOn(game.hud, 'renderGameState');
        game.renderHUD();
        expect(spy1).toHaveBeenCalledWith(0);
        expect(spy2).toHaveBeenCalled();
    });

    test('UIHud.renderScore() renders score text', () => {
        const spy = jest.spyOn(game.ctx, 'fillText');
        game.hud.renderScore(100);
        expect(spy).toHaveBeenCalledWith('Score: 100', 10, 20);
    });

    test('UIHud.renderGameState() renders state text', () => {
        const spy = jest.spyOn(game.ctx, 'fillText');
        game.hud.renderGameState('playing');
        expect(spy).toHaveBeenCalledWith('State: playing', 10, 45);
    });

    test('Game state transitions: menu -> playing -> paused -> playing -> gameover', () => {
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
