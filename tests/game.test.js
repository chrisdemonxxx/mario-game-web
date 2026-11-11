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
            font: '',
            fillStyle: '',
        };
    }
}

describe('Player Physics & Collision', () => {
    let player;
    let canvas;

    beforeEach(() => {
        canvas = new MockCanvas();
        player = new Player(100, 300, canvas);
    });

    test('Player initialized with correct properties', () => {
        expect(player.x).toBe(100);
        expect(player.y).toBe(300);
        expect(player.velocityX).toBe(0);
        expect(player.velocityY).toBe(0);
        expect(player.health).toBe(3);
    });

    test('Player movement - move left', () => {
        player.moveLeft();
        player.update();
        expect(player.velocityX).toBeLessThan(0);
    });

    test('Player movement - move right', () => {
        player.moveRight();
        player.update();
        expect(player.velocityX).toBeGreaterThan(0);
    });

    test('Player jump', () => {
        player.jump();
        expect(player.velocityY).toBeLessThan(0);
    });

    test('Gravity affects player velocity', () => {
        const initialVelocityY = player.velocityY;
        player.update();
        expect(player.velocityY).toBeGreaterThan(initialVelocityY);
    });

    test('Terminal velocity cap', () => {
        player.velocityY = 1000;
        player.update();
        expect(Math.abs(player.velocityY)).toBeLessThanOrEqual(15);
    });

    test('Player takes damage', () => {
        const initialHealth = player.health;
        player.takeDamage();
        expect(player.health).toBe(initialHealth - 1);
    });

    test('Player collision detection - AABB', () => {
        const box1 = { x: 0, y: 0, width: 32, height: 32 };
        const box2 = { x: 20, y: 20, width: 32, height: 32 };
        const box3 = { x: 100, y: 100, width: 32, height: 32 };
        
        expect(player.checkCollision(box1, box2)).toBe(true);
        expect(player.checkCollision(box1, box3)).toBe(false);
    });

    test('Player boundary checking', () => {
        player.x = -10;
        player.update();
        expect(player.x).toBeGreaterThanOrEqual(0);
    });
});

describe('Enemy Patrol AI', () => {
    let enemy;
    let canvas;

    beforeEach(() => {
        canvas = new MockCanvas();
        enemy = new Enemy(300, 400, 'goomba', canvas);
    });

    test('Enemy initialized with correct properties', () => {
        expect(enemy.x).toBe(300);
        expect(enemy.y).toBe(400);
        expect(enemy.type).toBe('goomba');
        expect(enemy.velocityX).toBe(2);
    });

    test('Enemy patrol - move right', () => {
        const initialX = enemy.x;
        enemy.update();
        expect(enemy.x).toBeGreaterThan(initialX);
    });

    test('Enemy patrol - move left', () => {
        enemy.velocityX = -2;
        const initialX = enemy.x;
        enemy.update();
        expect(enemy.x).toBeLessThan(initialX);
    });

    test('Enemy turns around at boundary', () => {
        enemy.x = 450;
        enemy.velocityX = 2;
        enemy.patrolDistance = 150;
        enemy.update();
        expect(Math.sign(enemy.velocityX)).toBe(-1);
    });

    test('Enemy collision detection with player', () => {
        const player = { x: 310, y: 400, width: 32, height: 32 };
        const collision = enemy.checkCollision(player);
        expect(collision).toBe(true);
    });

    test('Enemy maintains patrol distance', () => {
        enemy.patrolDistance = 100;
        let minX = enemy.x;
        let maxX = enemy.x;
        for (let i = 0; i < 100; i++) {
            enemy.update();
            minX = Math.min(minX, enemy.x);
            maxX = Math.max(maxX, enemy.x);
        }
        expect(maxX - minX).toBeLessThanOrEqual(100 + 10);
    });

    test('Enemy animation frame cycling', () => {
        const initialFrame = enemy.animationFrame;
        enemy.update();
        expect(enemy.animationFrame).toBeGreaterThanOrEqual(initialFrame);
    });
});

describe('Level Management', () => {
    let level;
    let canvas;

    beforeEach(() => {
        canvas = new MockCanvas();
        level = new Level(1, canvas);
    });

    test('Level initialized with correct ID', () => {
        expect(level.levelId).toBe(1);
    });

    test('Level next - progress to next level', () => {
        const nextLevel = level.next();
        expect(nextLevel.levelId).toBe(2);
    });

    test('Level previous - go back to previous level', () => {
        level.levelId = 2;
        const prevLevel = level.previous();
        expect(prevLevel.levelId).toBe(1);
    });

    test('Level select by index', () => {
        const level2 = Level.selectByIndex(2);
        expect(level2.levelId).toBe(2);
    });

    test('Level count consistency', () => {
        const totalLevels = 3;
        expect(Level.getLevelCount()).toBe(totalLevels);
    });

    test('Level completion tracking', () => {
        level.markCompleted();
        expect(level.isCompleted()).toBe(true);
    });

    test('Level progression state machine', () => {
        expect(level.isInProgress()).toBe(true);
        level.markCompleted();
        expect(level.isInProgress()).toBe(false);
    });
});

describe('Game Scoring & Collectibles', () => {
    let game;
    let canvas;

    beforeEach(() => {
        canvas = new MockCanvas();
        game = new (require('../src/game').Game)(canvas);
    });

    test('Coin initialization', () => {
        const coin = { x: 150, y: 200, collected: false };
        expect(coin.collected).toBe(false);
    });

    test('Coin collection adds to score', () => {
        const initialScore = game.score || 0;
        game.collectCoin();
        expect(game.score).toBeGreaterThan(initialScore);
    });

    test('Score accumulation per coin', () => {
        const coinValue = 10;
        const initialScore = 0;
        game.score = initialScore;
        game.collectCoin();
        expect(game.score).toBeGreaterThanOrEqual(initialScore + coinValue);
    });

    test('Level completion bonus', () => {
        const initialScore = 0;
        game.score = initialScore;
        game.completeLevel();
        expect(game.score).toBeGreaterThan(initialScore);
    });

    test('Score persistence across levels', () => {
        game.score = 500;
        const scoreBeforeLevelChange = game.score;
        game.nextLevel();
        expect(game.score).toBe(scoreBeforeLevelChange);
    });
});

module.exports = {};
