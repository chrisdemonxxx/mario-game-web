const { Player } = require('../src/player.js');

describe('Player', () => {
    let player;

    beforeEach(() => {
        player = new Player(100, 100);
    });

    describe('initialization', () => {
        test('should initialize with correct position', () => {
            expect(player.x).toBe(100);
            expect(player.y).toBe(100);
        });

        test('should initialize with correct dimensions', () => {
            expect(player.width).toBe(20);
            expect(player.height).toBe(20);
        });

        test('should initialize with zero velocity', () => {
            expect(player.velocityX).toBe(0);
            expect(player.velocityY).toBe(0);
        });

        test('should initialize as grounded', () => {
            expect(player.isGrounded).toBe(false);
            expect(player.isJumping).toBe(false);
        });

        test('should have proper physics properties', () => {
            expect(player.speed).toBe(5);
            expect(player.jumpPower).toBe(15);
            expect(player.gravity).toBe(0.6);
        });
    });

    describe('movement', () => {
        test('moveLeft should set negative velocity', () => {
            player.moveLeft();
            expect(player.velocityX).toBe(-5);
        });

        test('moveRight should set positive velocity', () => {
            player.moveRight();
            expect(player.velocityX).toBe(5);
        });

        test('stopMoving should set velocity to zero', () => {
            player.moveLeft();
            player.stopMoving();
            expect(player.velocityX).toBe(0);
        });

        test('should move left over multiple updates', () => {
            player.moveLeft();
            const initialX = player.x;
            player.update(300);
            expect(player.x).toBeLessThan(initialX);
        });

        test('should move right over multiple updates', () => {
            player.moveRight();
            const initialX = player.x;
            player.update(300);
            expect(player.x).toBeGreaterThan(initialX);
        });
    });

    describe('jumping and gravity', () => {
        test('jump should set negative velocity when grounded', () => {
            player.isGrounded = true;
            player.jump();
            expect(player.velocityY).toBe(-15);
            expect(player.isJumping).toBe(true);
        });

        test('jump should not work when not grounded', () => {
            player.isGrounded = false;
            player.jump();
            expect(player.velocityY).toBe(0);
            expect(player.isJumping).toBe(false);
        });

        test('applyGravity should increase velocity downward', () => {
            player.isGrounded = false;
            player.velocityY = 0;
            player.applyGravity();
            expect(player.velocityY).toBe(0.6);
        });

        test('applyGravity should be limited by maxFallSpeed', () => {
            player.isGrounded = false;
            player.velocityY = 10;
            player.applyGravity();
            expect(player.velocityY).toBeLessThanOrEqual(player.maxFallSpeed);
        });

        test('applyGravity should not apply when grounded', () => {
            player.isGrounded = true;
            player.velocityY = 0;
            player.applyGravity();
            expect(player.velocityY).toBe(0);
        });
    });

    describe('ground collision', () => {
        test('checkGroundCollision should detect ground contact', () => {
            player.y = 280;
            player.velocityY = 5;
            player.checkGroundCollision(300);
            expect(player.isGrounded).toBe(true);
            expect(player.velocityY).toBe(0);
        });

        test('checkGroundCollision should stop falling when hitting ground', () => {
            player.y = 285;
            player.velocityY = 10;
            player.checkGroundCollision(300);
            expect(player.y).toBe(280);
            expect(player.isJumping).toBe(false);
        });

        test('checkGroundCollision should set isGrounded false when above ground', () => {
            player.y = 100;
            player.isGrounded = true;
            player.checkGroundCollision(300);
            expect(player.isGrounded).toBe(false);
        });

        test('update should apply gravity and check ground collision', () => {
            player.isGrounded = false;
            player.velocityY = 0;
            player.y = 280;
            player.update(300);
            expect(player.isGrounded).toBe(true);
            expect(player.y).toBe(280);
        });
    });

    describe('position and velocity queries', () => {
        test('getPosition should return current position', () => {
            const pos = player.getPosition();
            expect(pos.x).toBe(100);
            expect(pos.y).toBe(100);
        });

        test('getVelocity should return current velocity', () => {
            player.velocityX = 5;
            player.velocityY = -10;
            const vel = player.getVelocity();
            expect(vel.x).toBe(5);
            expect(vel.y).toBe(-10);
        });
    });

    describe('collision detection', () => {
        test('checkCollision should detect overlap', () => {
            const obstacle = { x: 110, y: 110, width: 20, height: 20 };
            expect(player.checkCollision(obstacle)).toBe(true);
        });

        test('checkCollision should not detect overlap when separated horizontally', () => {
            const obstacle = { x: 200, y: 100, width: 20, height: 20 };
            expect(player.checkCollision(obstacle)).toBe(false);
        });

        test('checkCollision should not detect overlap when separated vertically', () => {
            const obstacle = { x: 100, y: 200, width: 20, height: 20 };
            expect(player.checkCollision(obstacle)).toBe(false);
        });

        test('checkCollision should detect overlap at edges', () => {
            const obstacle = { x: 119, y: 100, width: 20, height: 20 };
            expect(player.checkCollision(obstacle)).toBe(true);
        });

        test('checkCollision should not detect overlap with no intersection', () => {
            const obstacle = { x: 121, y: 100, width: 20, height: 20 };
            expect(player.checkCollision(obstacle)).toBe(false);
        });
    });

    describe('integration tests', () => {
        test('full jump sequence should work', () => {
            player.isGrounded = true;
            player.y = 280;
            player.velocityY = 0;
            
            player.jump();
            expect(player.isJumping).toBe(true);
            expect(player.velocityY).toBe(-15);
            
            player.update(300);
            expect(player.y).toBeLessThan(280);
            
            // Continue applying gravity until landing
            let iterations = 0;
            while (!player.isGrounded && iterations < 100) {
                player.update(300);
                iterations++;
            }
            expect(player.isGrounded).toBe(true);
            expect(player.isJumping).toBe(false);
        });

        test('movement during jump should work', () => {
            player.isGrounded = true;
            player.y = 280;
            player.jump();
            player.moveRight();
            
            const startX = player.x;
            player.update(300);
            
            expect(player.x).toBeGreaterThan(startX);
            expect(player.isJumping).toBe(true);
        });
    });
});
