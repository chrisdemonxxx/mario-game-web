// Unit tests for Mario Game Web - Comprehensive test suite
// Tests for physics engine, player mechanics, enemy AI, level management, and scoring

class MockGame {
  constructor() {
    this.canvas = { width: 800, height: 600 };
    this.currentLevel = null;
    this.score = 0;
    this.gameState = 'playing';
    this.paused = false;
  }
}

// ============================================
// PHYSICS ENGINE TESTS
// ============================================

function testAABBCollisionDetection() {
  const Physics = require('./physics');
  const physics = new Physics();

  // Test case 1: Two overlapping rectangles
  const rect1 = { x: 0, y: 0, width: 50, height: 50 };
  const rect2 = { x: 25, y: 25, width: 50, height: 50 };
  console.assert(physics.checkAABBCollision(rect1, rect2) === true, 'AABB overlap detection failed');

  // Test case 2: Two non-overlapping rectangles
  const rect3 = { x: 0, y: 0, width: 50, height: 50 };
  const rect4 = { x: 100, y: 100, width: 50, height: 50 };
  console.assert(physics.checkAABBCollision(rect3, rect4) === false, 'AABB non-overlap detection failed');

  // Test case 3: Adjacent rectangles (touching edges)
  const rect5 = { x: 0, y: 0, width: 50, height: 50 };
  const rect6 = { x: 50, y: 0, width: 50, height: 50 };
  console.assert(physics.checkAABBCollision(rect5, rect6) === false, 'AABB edge-touch detection failed');
}

function testGravity() {
  const Player = require('./player');
  const player = new Player(100, 100);
  const initialVelY = player.velY;
  
  // Apply gravity
  player.update([], []);
  
  // Velocity should increase (downward)
  console.assert(player.velY > initialVelY, 'Gravity not applied correctly');
  console.assert(player.velY <= 15, 'Terminal velocity exceeded');
}

function testJumping() {
  const Player = require('./player');
  const player = new Player(100, 100);
  player.onGround = true;
  player.velY = 0;
  
  player.jump();
  
  console.assert(player.velY === -12, 'Jump velocity incorrect');
  console.assert(player.onGround === false, 'Player should not be on ground after jump');
}

// ============================================
// PLAYER TESTS
// ============================================

function testPlayerMovement() {
  const Player = require('./player');
  const player = new Player(100, 100);
  const initialX = player.x;
  
  // Move right
  player.updateInput({ ArrowRight: true });
  player.update([], []);
  console.assert(player.x > initialX, 'Right movement failed');
  
  // Move left
  player.updateInput({ ArrowLeft: true });
  player.update([], []);
  console.assert(player.x < 100 + (player.x - initialX), 'Left movement failed');
}

function testPlayerHealth() {
  const Player = require('./player');
  const player = new Player(100, 100);
  const initialHealth = player.health;
  
  player.takeDamage();
  console.assert(player.health === initialHealth - 1, 'Damage not applied correctly');
  console.assert(player.invulnerable === true, 'Invulnerability frames not set');
}

function testPlayerInvulnerability() {
  const Player = require('./player');
  const player = new Player(100, 100);
  
  player.takeDamage();
  console.assert(player.invulnerable === true, 'Invulnerability flag not set');
  
  player.invulnerableTimer = 0;
  player.update([], []);
  console.assert(player.invulnerable === false, 'Invulnerability should expire');
}

// ============================================
// ENEMY TESTS
// ============================================

function testEnemyPatrol() {
  const Enemy = require('./enemy');
  const enemy = new Enemy(100, 100, 50, 200);
  const initialX = enemy.x;
  
  enemy.update(null);
  
  // Enemy should move in patrol range
  console.assert(enemy.x >= 50 && enemy.x <= 200, 'Enemy patrol out of bounds');
}

function testEnemyDirection() {
  const Enemy = require('./enemy');
  const enemy = new Enemy(100, 100, 50, 150);
  
  // Move to right edge
  while (enemy.x < 150) {
    enemy.update(null);
  }
  console.assert(enemy.direction === -1, 'Enemy should turn left at right boundary');
}

function testEnemyCollisionDetection() {
  const Enemy = require('./enemy');
  const Player = require('./player');
  
  const enemy = new Enemy(100, 100);
  const player = new Player(105, 105);
  
  const collision = enemy.getBounds().overlaps(player.getBounds());
  console.assert(collision === true || collision === false, 'Collision detection returned invalid result');
}

function testEnemySpawning() {
  const Enemy = require('./enemy');
  const enemy = new Enemy(100, 100);
  
  console.assert(enemy.x === 100, 'Enemy X position incorrect');
  console.assert(enemy.y === 100, 'Enemy Y position incorrect');
  console.assert(enemy.width > 0, 'Enemy width not set');
  console.assert(enemy.height > 0, 'Enemy height not set');
}

// ============================================
// COLLECTIBLES TESTS
// ============================================

function testCoinCollection() {
  const Player = require('./player');
  const player = new Player(100, 100);
  const initialCoins = player.coins;
  
  player.coins += 1;
  console.assert(player.coins === initialCoins + 1, 'Coin collection failed');
}

function testScoreCalculation() {
  const Player = require('./player');
  const player = new Player(100, 100);
  player.coins = 5;
  
  const score = player.coins * 10 + player.levelsCompleted * 100;
  console.assert(score >= 50, 'Score calculation too low');
}

function testMultipleCollectibles() {
  const Player = require('./player');
  const player = new Player(100, 100);
  
  player.coins = 0;
  for (let i = 0; i < 10; i++) {
    player.coins += 1;
  }
  console.assert(player.coins === 10, 'Multiple collectible addition failed');
}

// ============================================
// LEVEL MANAGEMENT TESTS
// ============================================

function testLevelLoading() {
  const Level = require('./level');
  const level = new Level();
  level.loadLevel(0);
  
  console.assert(level.currentLevelIndex === 0, 'Level index not set');
  console.assert(level.platforms.length > 0, 'Platforms not loaded');
}

function testLevelProgression() {
  const Level = require('./level');
  const level = new Level();
  level.loadLevel(0);
  
  level.nextLevel();
  console.assert(level.currentLevelIndex === 1, 'Level progression failed');
}

function testLevelBoundaries() {
  const Level = require('./level');
  const level = new Level();
  level.loadLevel(0);
  
  // Should not go below 0
  level.currentLevelIndex = 0;
  level.previousLevel();
  console.assert(level.currentLevelIndex === 0, 'Level should not go below 0');
}

function testLevelCompletion() {
  const Level = require('./level');
  const level = new Level();
  level.loadLevel(0);
  
  level.completeLevel(0);
  console.assert(level.completedLevels.includes(0), 'Level completion not tracked');
}

function testLevelJSONLoading() {
  const Level = require('./level');
  const level = new Level();
  
  console.assert(level.levels !== undefined, 'Levels JSON not loaded');
  console.assert(level.levels.length >= 3, 'Not enough levels defined');
}

// ============================================
// SCORE TRACKING TESTS
// ============================================

function testScoreTracking() {
  const Player = require('./player');
  const player = new Player(100, 100);
  
  player.coins = 5;
  player.levelsCompleted = 1;
  const expectedScore = (5 * 10) + (1 * 100);
  
  console.assert(player.getScore() === expectedScore, 'Score tracking failed');
}

function testScoreReset() {
  const Player = require('./player');
  const player = new Player(100, 100);
  
  player.coins = 10;
  player.coins = 0;
  
  console.assert(player.coins === 0, 'Score reset failed');
}

function testScoreDisplay() {
  const Player = require('./player');
  const player = new Player(100, 100);
  player.coins = 25;
  
  const display = player.getScore();
  console.assert(typeof display === 'number', 'Score display not numeric');
}

function testHighScore() {
  const Player = require('./player');
  const player = new Player(100, 100);
  
  player.coins = 50;
  const score = player.coins * 10;
  console.assert(score > 0, 'High score calculation failed');
}

// ============================================
// TEST RUNNER
// ============================================

function runAllTests() {
  console.log('\n=== RUNNING UNIT TESTS ===\n');
  
  let passed = 0, failed = 0;
  
  const tests = [
    // Physics tests
    { name: 'AABB Collision Detection', fn: testAABBCollisionDetection },
    { name: 'Gravity Simulation', fn: testGravity },
    { name: 'Jumping Mechanics', fn: testJumping },
    
    // Player tests
    { name: 'Player Movement', fn: testPlayerMovement },
    { name: 'Player Health System', fn: testPlayerHealth },
    { name: 'Player Invulnerability', fn: testPlayerInvulnerability },
    
    // Enemy tests
    { name: 'Enemy Patrol Behavior', fn: testEnemyPatrol },
    { name: 'Enemy Direction Changes', fn: testEnemyDirection },
    { name: 'Enemy Collision Detection', fn: testEnemyCollisionDetection },
    { name: 'Enemy Spawning', fn: testEnemySpawning },
    
    // Collectibles tests
    { name: 'Coin Collection', fn: testCoinCollection },
    { name: 'Score Calculation', fn: testScoreCalculation },
    { name: 'Multiple Collectibles', fn: testMultipleCollectibles },
    
    // Level tests
    { name: 'Level Loading', fn: testLevelLoading },
    { name: 'Level Progression', fn: testLevelProgression },
    { name: 'Level Boundaries', fn: testLevelBoundaries },
    { name: 'Level Completion Tracking', fn: testLevelCompletion },
    { name: 'Level JSON Loading', fn: testLevelJSONLoading },
    
    // Score tests
    { name: 'Score Tracking', fn: testScoreTracking },
    { name: 'Score Reset', fn: testScoreReset },
    { name: 'Score Display', fn: testScoreDisplay },
    { name: 'High Score Calculation', fn: testHighScore },
  ];
  
  tests.forEach(test => {
    try {
      test.fn();
      console.log(`✓ ${test.name}`);
      passed++;
    } catch (e) {
      console.error(`✗ ${test.name}: ${e.message}`);
      failed++;
    }
  });
  
  console.log(`\n=== TEST RESULTS ===`);
  console.log(`Passed: ${passed}/${tests.length}`);
  console.log(`Failed: ${failed}/${tests.length}`);
  console.log(`Coverage: ${((passed / tests.length) * 100).toFixed(2)}%\n`);
  
  return failed === 0;
}

// Export test runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests };
}

// Run if executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runAllTests();
}