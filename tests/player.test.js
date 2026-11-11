/**
 * Tests for the Player class - Main character with platformer movement and jumping physics
 */

const { Player } = require('../src/player.js');

describe('Player', () => {
    let player;

    beforeEach(() => {
        player = new Player(100, 200);
    });

    describe('Initialization', () => {
        test('should create a player with correct initial position', () => {
            expect(player.x).toBe(100);
            expect(player.y).toBe(200);
            expect(player.respawnX).toBe(100);
            expect(player.respawnY).toBe(200);
        });

        test('should initialize with zero velocity', () => {
            expect(player.vx).toBe(0);
            expect(player.vy).toBe(0);
        });

        test('should initialize with correct physics properties', () => {
            expect(player.moveSpeed).toBe(150);
            expect(player.jumpForce).toBe(400);
            expect(player.gravity).toBe(600);
            expect(player.maxFallSpeed).toBe(500);
        });

        test('should initialize as not grounded and idle', () => {
            expect(player.isGrounded).toBe(false);
            expect(player.animationState).toBe('idle');
            expect(player.currentFrame).toBe(0);
        });

        test('should initialize with correct dimensions', () => {
            expect(player.width).toBe(32);
            expect(player.height).toBe(32);
        });

        test('should initialize facing right', () => {
            expect(player.direction).toBe(1);
        });
    });

    describe('Horizontal Movement', () => {
        test('should move right when right input is pressed', () => {
            player.setGrounded(true);
            player.inputState.right = true;
            const initialX = player.x;

            player.update(0.1);

            expect(player.x).toBeGreaterThan(initialX);
            expect(player.direction).toBe(1);
        });

        test('should move left when left input is pressed', () => {
            player.setGrounded(true);
            player.inputState.left = true;
            const initialX = player.x;

            player.update(0.1);

            expect(player.x).toBeLessThan(initialX);
            expect(player.direction).toBe(-1);
        });

        test('should not move horizontally with no input', () => {
            player.setGrounded(true);
            const initialX = player.x;

            player.update(0.1);

            expect(player.x).toBe(initialX);
        });

        test('should move at constant speed (frame-independent)', () => {
            player.setGrounded(true);
            player.inputState.right = true;

            const x1 = player.x;
            player.update(0.1);
            const x2 = player.x;
            player.update(0.1);
            const x3 = player.x;

            const dist1 = x2 - x1;
            const dist2 = x3 - x2;

            expect(Math.abs(dist1 - dist2)).toBeLessThan(0.1);
        });

        test('should update animation state to running when moving', () => {
            player.setGrounded(true);
            player.inputState.right = true;

            player.update(0.1);

            expect(player.animationState).toBe('running');
        });

        test('should update animation state to idle when stationary', () => {
            player.setGrounded(true);
            player.inputState.right = false;

            player.update(0.1);

            expect(player.animationState).toBe('idle');
        });
    });

    describe('Jumping Mechanics', () => {
        test('should jump when grounded and jump is called', () => {
            player.setGrounded(true);

            player.jump();

            expect(player.vy).toBeLessThan(0);
            expect(player.isJumping).toBe(true);
            expect(player.isGrounded).toBe(false);
        });

        test('should not jump when already airborne', () => {
            player.setGrounded(false);
            const initialVy = player.vy;

            player.jump();

            expect(player.vy).toBe(initialVy);
        });

        test('should apply correct jump force', () => {
            player.setGrounded(true);

            player.jump();

            expect(player.vy).toBe(-player.jumpForce);
        });

        test('should update animation state to jumping', () => {
            player.setGrounded(true);

            player.jump();
            player.update(0.01);

            expect(player.animationState).toBe('jumping');
        });

        test('should update animation state to falling when falling', () => {
            player.setGrounded(false);
            player.vy = 100;

            player.update(0.1);

            expect(player.animationState).toBe('falling');
        });

        test('should not fall faster than maxFallSpeed', () => {
            player.setGrounded(false);
            player.vy = 0;

            for (let i = 0; i < 100; i++) {
                player.update(0.1);
            }

            expect(player.vy).toBeLessThanOrEqual(player.maxFallSpeed);
        });
    });

    describe('Variable Jump Height', () => {
        test('should have reduced jump height when button released early', () => {
            player.setGrounded(true);
            player.jump();

            player.releaseJump();
            const vy1 = player.vy;

            player.update(0.05);

            expect(player.vy).toBeGreaterThan(vy1);
        });

        test('should maintain full jump height when button held', () => {
            player.setGrounded(true);
            player.jump();

            player.inputState.jump = true;
            player.update(0.05);

            expect(player.isJumping).toBe(true);
        });
    });

    describe('Gravity and Physics', () => {
        test('should apply gravity when airborne', () => {
            player.setGrounded(false);
            player.vy = 0;

            const oldVy = player.vy;
            player.update(0.1);

            expect(player.vy).toBeGreaterThan(oldVy);
        });

        test('should not apply gravity when grounded', () => {
            player.setGrounded(true);
            player.vy = 0;

            player.update(0.1);

            expect(player.vy).toBe(0);
        });

        test('should apply vertical velocity to position', () => {
            player.setGrounded(false);
            player.vy = 100;
            const initialY = player.y;

            player.update(0.1);

            // Gravity is applied first: vy = 100 + 600*0.1 = 160
            // Then position is updated: y = 200 + 160*0.1 = 216
            const expectedY = initialY + (100 + 600 * 0.1) * 0.1;
            expect(player.y).toBeCloseTo(expectedY, 0);
        });

        test('should zero velocity when grounded', () => {
            player.vy = 100;

            player.setGrounded(true);

            expect(player.vy).toBe(0);
        });
    });

    describe('Collision and Damage', () => {
        test('should mark as dead when taking damage', () => {
            expect(player.isDead).toBe(false);

            player.takeDamage();

            expect(player.isDead).toBe(true);
            expect(player.isHit).toBe(true);
        });

        test('should update animation to dead state when hit', () => {
            player.setGrounded(true);

            player.takeDamage();
            player.update(0.01);

            expect(player.animationState).toBe('dead');
        });

        test('should not take multiple damages', () => {
            player.takeDamage();
            player.takeDamage();

            expect(player.isDead).toBe(true);
        });

        test('should not update when dead', () => {
            player.isDead = true;
            const initialX = player.x;
            player.inputState.right = true;

            player.update(0.1);

            expect(player.x).toBe(initialX);
        });
    });

    describe('Respawning', () => {
        test('should respawn at respawn position when falling too far', () => {
            player.respawnX = 100;
            player.respawnY = 200;
            player.x = 100;
            player.y = 200 + 700;

            player.update(0.1);

            expect(player.x).toBe(100);
            expect(player.y).toBe(200);
        });

        test('should reset velocity on respawn', () => {
            player.vy = 500;
            player.vx = 100;
            player.y = player.respawnY + 700;

            player.update(0.1);

            expect(player.vx).toBe(0);
            expect(player.vy).toBe(0);
        });

        test('should reset animation state to idle on respawn', () => {
            player.isDead = true;
            player.animationState = 'dead';
            player.y = player.respawnY + 700;

            player.update(0.1);

            expect(player.isDead).toBe(false);
            expect(player.animationState).toBe('idle');
            expect(player.direction).toBe(1);
        });

        test('should reset grounded state on respawn', () => {
            player.isGrounded = false;
            player.y = player.respawnY + 700;

            player.update(0.1);

            expect(player.isGrounded).toBe(true);
        });
    });

    describe('Input Handling', () => {
        test('should set left input', () => {
            player.setInput('left', true);
            expect(player.inputState.left).toBe(true);

            player.setInput('left', false);
            expect(player.inputState.left).toBe(false);
        });

        test('should set right input', () => {
            player.setInput('right', true);
            expect(player.inputState.right).toBe(true);

            player.setInput('right', false);
            expect(player.inputState.right).toBe(false);
        });

        test('should handle simultaneous left and right input', () => {
            player.setGrounded(true);
            player.inputState.left = true;
            player.inputState.right = true;

            player.update(0.1);

            expect(player.vx).toBeLessThan(0);
        });
    });

    describe('Rendering', () => {
        test('should not render with null context', () => {
            expect(() => {
                player.render(null);
            }).not.toThrow();
        });

        test('should render placeholder without error', () => {
            const mockCtx = {
                save: jest.fn(),
                restore: jest.fn(),
                translate: jest.fn(),
                scale: jest.fn(),
                fillRect: jest.fn(),
                fillStyle: '',
                strokeStyle: '',
                arc: jest.fn(),
                stroke: jest.fn(),
                beginPath: jest.fn(),
            };

            expect(() => {
                player.render(mockCtx);
            }).not.toThrow();

            expect(mockCtx.save).toHaveBeenCalled();
            expect(mockCtx.restore).toHaveBeenCalled();
        });

        test('should flip sprite when facing left', () => {
            const mockCtx = {
                save: jest.fn(),
                restore: jest.fn(),
                translate: jest.fn(),
                scale: jest.fn(),
                fillRect: jest.fn(),
                fillStyle: '',
                strokeStyle: '',
                arc: jest.fn(),
                stroke: jest.fn(),
                beginPath: jest.fn(),
            };

            player.direction = -1;
            player.render(mockCtx);

            expect(mockCtx.scale).toHaveBeenCalledWith(-1, 1);
        });
    });

    describe('Animation State Machine', () => {
        test('should transition from idle to running', () => {
            player.setGrounded(true);
            expect(player.animationState).toBe('idle');

            player.inputState.right = true;
            player.update(0.1);

            expect(player.animationState).toBe('running');
        });

        test('should transition from running to idle', () => {
            player.setGrounded(true);
            player.inputState.right = true;
            player.update(0.1);
            expect(player.animationState).toBe('running');

            player.inputState.right = false;
            player.update(0.1);

            expect(player.animationState).toBe('idle');
        });

        test('should transition to jumping', () => {
            player.setGrounded(true);
            player.jump();
            player.update(0.01);

            expect(player.animationState).toBe('jumping');
        });

        test('should cycle through animation frames for running', () => {
            player.setGrounded(true);
            player.inputState.right = true;

            player.update(0.16);
            const frame1 = player.currentFrame;

            player.update(0.16);
            const frame2 = player.currentFrame;

            expect(frame1).not.toBe(frame2);
        });

        test('should reset frame when animation state changes', () => {
            player.setGrounded(true);
            player.inputState.right = true;
            player.update(0.2);

            player.inputState.right = false;
            player.update(0.01);

            expect(player.currentFrame).toBe(0);
        });
    });

    describe('Frame-Independent Timing', () => {
        test('should move same distance with different frame rates', () => {
            const player1 = new Player(0, 0);
            player1.setGrounded(true);
            player1.inputState.right = true;
            player1.update(0.016);
            player1.update(0.016);
            const x1 = player1.x;

            const player2 = new Player(0, 0);
            player2.setGrounded(true);
            player2.inputState.right = true;
            player2.update(0.032);
            const x2 = player2.x;

            expect(Math.abs(x1 - x2)).toBeLessThan(0.1);
        });
    });

    describe('Integration Scenarios', () => {
        test('should complete a full jump arc', () => {
            player.setGrounded(true);
            const startY = player.y;

            player.jump();
            expect(player.vy).toBeLessThan(0);

            for (let i = 0; i < 10; i++) {
                player.update(0.05);
            }
            const peakY = player.y;
            expect(peakY).toBeLessThan(startY);

            for (let i = 0; i < 20; i++) {
                player.update(0.05);
            }
            expect(player.y).toBeGreaterThan(peakY);
        });

        test('should handle moving and jumping simultaneously', () => {
            player.setGrounded(true);
            player.inputState.right = true;
            player.jump();

            const startX = player.x;
            const startY = player.y;

            player.update(0.1);

            expect(player.x).toBeGreaterThan(startX);
            expect(player.y).toBeLessThan(startY);
            expect(player.animationState).toBe('jumping');
        });

        test('should land and continue moving', () => {
            player.setGrounded(true);
            player.jump();

            for (let i = 0; i < 50; i++) {
                player.update(0.05);
            }

            player.setGrounded(true);

            expect(player.isJumping).toBe(true);
            expect(player.isGrounded).toBe(true);
            expect(player.vy).toBe(0);
        });
    });
});
