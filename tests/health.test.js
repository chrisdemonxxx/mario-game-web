const { Game, HealthSystem } = require('../src/game.js');

describe('Health and Game Over System', () => {
    let canvas;
    let game;

    beforeEach(() => {
        canvas = { getContext: () => ({}) };
        game = new Game(canvas);
    });

    test('HealthSystem initializes with max health', () => {
        const health = new HealthSystem(100);
        expect(health.currentHealth).toBe(100);
        expect(health.maxHealth).toBe(100);
        expect(health.isAlive).toBe(true);
    });

    test('HealthSystem.takeDamage reduces health', () => {
        const health = new HealthSystem(100);
        health.takeDamage(25);
        expect(health.currentHealth).toBe(75);
        expect(health.isAlive).toBe(true);
    });

    test('HealthSystem.takeDamage below zero sets health to zero', () => {
        const health = new HealthSystem(100);
        health.takeDamage(150);
        expect(health.currentHealth).toBe(0);
        expect(health.isAlive).toBe(false);
    });

    test('HealthSystem.heal restores health', () => {
        const health = new HealthSystem(100);
        health.takeDamage(50);
        health.heal(30);
        expect(health.currentHealth).toBe(80);
    });

    test('HealthSystem.heal does not exceed max health', () => {
        const health = new HealthSystem(100);
        health.heal(50);
        expect(health.currentHealth).toBe(100);
    });

    test('HealthSystem.reset restores full health and alive state', () => {
        const health = new HealthSystem(100);
        health.takeDamage(100);
        expect(health.isAlive).toBe(false);
        health.reset();
        expect(health.currentHealth).toBe(100);
        expect(health.isAlive).toBe(true);
    });

    test('Game initializes with health system', () => {
        expect(game.health).toBeDefined();
        expect(game.health instanceof HealthSystem).toBe(true);
        expect(game.health.currentHealth).toBe(100);
    });

    test('Game.takeDamage reduces player health', () => {
        const initialHealth = game.health.currentHealth;
        game.takeDamage(10);
        expect(game.health.currentHealth).toBe(initialHealth - 10);
    });

    test('Game.takeDamage returns false when health reaches zero', () => {
        game.health.currentHealth = 10;
        const isAlive = game.takeDamage(20);
        expect(isAlive).toBe(false);
        expect(game.gameState).toBe('gameover');
    });

    test('Game.takeDamage returns true when health remains positive', () => {
        const isAlive = game.takeDamage(10);
        expect(isAlive).toBe(true);
        expect(game.gameState).not.toBe('gameover');
    });

    test('Game.endGame sets game state to gameover', () => {
        game.start();
        game.endGame();
        expect(game.gameState).toBe('gameover');
        expect(game.gameRunning).toBe(false);
    });

    test('Game.winGame sets game state to win', () => {
        game.start();
        game.winGame();
        expect(game.gameState).toBe('win');
        expect(game.gameRunning).toBe(false);
    });

    test('Game.start resets health', () => {
        game.health.takeDamage(50);
        expect(game.health.currentHealth).toBe(50);
        game.start();
        expect(game.health.currentHealth).toBe(100);
        expect(game.health.isAlive).toBe(true);
    });

    test('Health goes to gameover when depleted', () => {
        while (game.health.currentHealth > 0) {
            game.takeDamage(20);
        }
        expect(game.gameState).toBe('gameover');
        expect(game.gameRunning).toBe(false);
    });
});
