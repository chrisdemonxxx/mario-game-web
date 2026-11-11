describe('Health and Game Over System', () => {
    let canvas;
    let game;

    beforeEach(() => {
        canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        game = new Game(canvas);
    });

    test('Game initializes with health system', () => {
        expect(game.health).toBeDefined();
        expect(game.health.currentHealth).toBe(100);
        expect(game.health.maxHealth).toBe(100);
        expect(game.health.isAlive).toBe(true);
    });

    test('HealthSystem takes damage correctly', () => {
        const health = new HealthSystem(100);
        const isAlive = health.takeDamage(30);
        expect(health.currentHealth).toBe(70);
        expect(isAlive).toBe(true);
    });

    test('HealthSystem dies when health reaches 0', () => {
        const health = new HealthSystem(100);
        health.takeDamage(100);
        expect(health.currentHealth).toBe(0);
        expect(health.isAlive).toBe(false);
    });

    test('HealthSystem cannot go below 0', () => {
        const health = new HealthSystem(100);
        health.takeDamage(150);
        expect(health.currentHealth).toBe(0);
        expect(health.isAlive).toBe(false);
    });

    test('HealthSystem heals correctly', () => {
        const health = new HealthSystem(100);
        health.takeDamage(50);
        health.heal(30);
        expect(health.currentHealth).toBe(80);
    });

    test('HealthSystem cannot exceed max health', () => {
        const health = new HealthSystem(100);
        health.takeDamage(50);
        health.heal(100);
        expect(health.currentHealth).toBe(100);
    });

    test('HealthSystem resets correctly', () => {
        const health = new HealthSystem(100);
        health.takeDamage(75);
        health.reset();
        expect(health.currentHealth).toBe(100);
        expect(health.isAlive).toBe(true);
    });

    test('Game.start() resets health', () => {
        game.health.takeDamage(50);
        game.start();
        expect(game.health.currentHealth).toBe(100);
        expect(game.gameState).toBe('playing');
    });

    test('Game.takeDamage() reduces health', () => {
        game.start();
        const isAlive = game.takeDamage(25);
        expect(game.health.currentHealth).toBe(75);
        expect(isAlive).toBe(true);
        expect(game.gameState).toBe('playing');
    });

    test('Game ends when health depletes', () => {
        game.start();
        game.takeDamage(100);
        expect(game.gameState).toBe('gameover');
        expect(game.gameRunning).toBe(false);
    });

    test('Game.winGame() sets win state', () => {
        game.start();
        game.winGame();
        expect(game.gameState).toBe('win');
        expect(game.gameRunning).toBe(false);
    });

    test('Multiple damage hits leading to game over', () => {
        game.start();
        game.takeDamage(30);
        expect(game.health.currentHealth).toBe(70);
        game.takeDamage(40);
        expect(game.health.currentHealth).toBe(30);
        game.takeDamage(30);
        expect(game.health.currentHealth).toBe(0);
        expect(game.gameState).toBe('gameover');
    });
});
