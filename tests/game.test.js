const { Game } = require('../src/game');

describe('Game', () => {
    test('initialises with score 0 and running state', () => {
        const canvas = { getContext: () => ({}) };
        const game = new Game(canvas);
        expect(game.score).toBe(0);
        expect(game.gameRunning).toBe(true);
    });
});
