// Comprehensive test suite for Mario Game Web
const { Player } = require('../src/player');
const { Enemy } = require('../src/enemy');

describe('Player Class', () => {
    test('Player Initialization', () => {
        const player = new Player(100, 50, null);
        expect(player.x).toBe(100);
        expect(player.y).toBe(50);
        expect(player.health).toBe(3);
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
        player.jump();
        expect(player.velocityY).toBe(-10);
    });

    test('Player Has Health', () => {
        const player = new Player(100, 50, null);
        expect(player.health).toBe(3);
    });
});

describe('Enemy Class', () => {
    test('Enemy Initialization', () => {
        const enemy = new Enemy(150, 30, 'goomba', null);
        expect(enemy.x).toBe(150);
        expect(enemy.y).toBe(30);
        expect(enemy.type).toBe('goomba');
    });

    test('Enemy Patrol Movement', () => {
        const enemy = new Enemy(100, 30, 'goomba', null);
        const initialX = enemy.x;
        enemy.update();
        expect(enemy.x).not.toBe(initialX);
    });

    test('Enemy Collision Detection', () => {
        const enemy = new Enemy(100, 30, 'goomba', null);
        const player = new Player(105, 35, null);
        expect(enemy.checkCollision(player)).toBe(true);
    });
});
