const Physics = require('./physics');
const Player = require('./player');
const Enemy = require('./enemy');
const Level = require('./level');

// Physics Tests
describe('Physics', () => {
  test('AABB collision detection - overlap', () => {
    const r1 = { x: 0, y: 0, width: 32, height: 32 };
    const r2 = { x: 20, y: 20, width: 32, height: 32 };
    expect(Physics.checkAABB(r1, r2)).toBe(true);
  });
  test('AABB no collision', () => {
    const r1 = { x: 0, y: 0, width: 32, height: 32 };
    const r2 = { x: 100, y: 100, width: 32, height: 32 };
    expect(Physics.checkAABB(r1, r2)).toBe(false);
  });
  test('Gravity increases velocity', () => {
    const obj = { vy: 0 };
    Physics.applyGravity(obj);
    expect(obj.vy).toBeGreaterThan(0);
  });
  test('Terminal velocity capped at 15px/s', () => {
    const obj = { vy: 20 };
    Physics.applyGravity(obj);
    expect(obj.vy).toBeLessThanOrEqual(15);
  });
});

// Player Tests
describe('Player', () => {
  let player;
  beforeEach(() => { player = new Player(100, 100); });
  
  test('Player spawns at correct position', () => {
    expect(player.x).toBe(100);
    expect(player.y).toBe(100);
  });
  test('Player has 3 health on spawn', () => {
    expect(player.health).toBe(3);
  });
  test('moveRight sets vx to 5', () => {
    player.moveRight();
    expect(player.vx).toBe(5);
  });
  test('takeDamage reduces health', () => {
    player.takeDamage();
    expect(player.health).toBe(2);
  });
  test('takeDamage activates invulnerability', () => {
    player.takeDamage();
    expect(player.invulnerable).toBe(true);
  });
  test('Player dies at map boundary', () => {
    player.y = 1000;
    player.update();
    expect(player.isDead()).toBe(true);
  });
  test('jump sets negative vy when on ground', () => {
    player.onGround = true;
    player.jump();
    expect(player.vy).toBeLessThan(0);
  });
  test('no double jump in air', () => {
    player.onGround = false;
    player.vy = -5;
    player.jump();
    expect(player.vy).toBe(-5);
  });
});

// Enemy AI Tests
describe('Enemy', () => {
  let enemy;
  beforeEach(() => { enemy = new Enemy(200, 300, 150, 250); });
  
  test('Enemy spawns at correct position', () => {
    expect(enemy.x).toBe(200);
    expect(enemy.y).toBe(300);
  });
  test('Enemy has patrol range', () => {
    expect(enemy.minX).toBe(150);
    expect(enemy.maxX).toBe(250);
  });
  test('Enemy patrol distance bounded', () => {
    for (let i = 0; i < 1000; i++) {
      enemy.update();
      expect(enemy.x).toBeGreaterThanOrEqual(enemy.minX - 10);
      expect(enemy.x).toBeLessThanOrEqual(enemy.maxX + 10);
    }
  });
  test('Enemy reverses at boundary', () => {
    enemy.x = enemy.maxX + 10;
    enemy.update();
    expect(enemy.dirX).toBe(-1);
  });
  test('Enemy detects player collision', () => {
    const p = new Player(205, 300);
    expect(enemy.checkCollision(p)).toBe(true);
  });
});

// Level Management Tests
describe('Level', () => {
  let level;
  beforeEach(() => { level = new Level(); });
  
  test('Level initializes with starting level', () => {
    expect(level.currentLevel).toBeGreaterThanOrEqual(0);
  });
  test('Level loads data by index', () => {
    const data = level.getLevelData(0);
    expect(data).toBeDefined();
    expect(data.platforms).toBeDefined();
    expect(data.enemies).toBeDefined();
  });
  test('Level tracks completed', () => {
    level.completeLevel();
    expect(level.completedLevels).toContain(level.currentLevel);
  });
  test('nextLevel increments', () => {
    const curr = level.currentLevel;
    level.nextLevel();
    expect(level.currentLevel).toBe(curr + 1);
  });
  test('previousLevel decrements', () => {
    level.currentLevel = 1;
    level.previousLevel();
    expect(level.currentLevel).toBe(0);
  });
});

// Scoring Tests
describe('Scoring', () => {
  let level;
  beforeEach(() => { level = new Level(); });
  
  test('Score starts at 0', () => {
    expect(level.score).toBe(0);
  });
  test('addScore adds points', () => {
    level.addScore(10);
    expect(level.score).toBe(10);
  });
  test('Score accumulates', () => {
    level.addScore(50);
    level.nextLevel();
    level.addScore(50);
    expect(level.score).toBe(100);
  });
});
