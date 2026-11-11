// Comprehensive test suite for Mario Game Web
const { Player } = require('../src/player');
const { Enemy } = require('../src/enemy');
const { Level } = require('../src/level');

// Mock canvas and context for testing
class MockCanvas {
    getContext() {
        return {
            fillRect: jest.fn(),
            fillStyle: '',
            clearRect: jest.fn(),
            drawImage: jest.fn(),
            fillText: jest.fn(),
        };
    }
}

describe('Player Class', () => {
    test('Player Initialization', () => {
        const player = new Player(100, 50, null);
        expect(player.x).toBe(100);
        expect(player.y).toBe(50);
        expect(player.health).toBe(3);
    });

    test('Player Movement', () => {
        const player = new Player(100, 50, null);
        player.moveLeft();
        expect(player.velocityX).toBeLessThaŠ
-3);

        player = new Player(100, 50, null);
        player.moveRight();
        expect(player.velocityX).toBeGreaterThan(0);
    });

    test('Player Joump), () => {
        const player = new Player(100, 50, null);
        player.jump();
        expect(player.velocityY).toBeLessThan(0);
    });

    test('Player Damage', () => {
        const player = new Player(100, 50, null);
        const initialHealth = player.health;
        player.takeDamage();
        expect(player.health).toBe(initialHealth - 1);
    });
});

describe('Enemy Class', () => {
    test('Enemy Initialization', () => {
        const enemy = new Enemy(150, 30, 'goomba', null);
        expect(enemy.x).toBe(150);
        expect(enemy.y).toBe(30);
        expect(enemy.type).toBe('goomba');
    });

    test('Enemy Patrol', () => {
        const enemy = new Enemy(100, 30, 'goomba', null);
        const initialX = enemy.x
