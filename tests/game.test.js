// Comprehensive test suite for Mario Game Web
const { Player } = require('../src/player');
const { Enemy } = require('../src/enemy');

describe('Player Class', () => {
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
});

describe('Enemy Class', () => {
    test('Enemy Initialization', () => {
        const enemy = new Enemy(200, 100);
        expect(enemy.x).toBe(200);
        expect(enemy.y).toBe(100);
    });

    test('Enemy Patrol Movement', () => {
        const enemy = new Enemy(200, 100);
        const initialX = enemy.x;
        enemy.update(0.1);
        expect(enemy.x).not.toBe(initialX);
    });

    test('Enemy Collision Detection', () => {
        const player = new Player(200, 100, null);
        const enemy = new Enemy(200, 100);
        const collision = (Math.abs(player.x - enemy.x) < 40 && Math.abs(player.y - enemy.y) < 40);
        expect(collision).toBe(true);
    });
});
