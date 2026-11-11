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

            player.update(0.01);

            expect(player.animationState).toBe('falling');
        });

        test('should not fall faster than maxFallSpeed', () => {
            player.setGrounded(false);
            player.vy = 1000;

            player.update(0.01);

            expect(player.vy).toBeLessThanOrEqual(player.maxFallSpeed);
        });
    });

    describe('Variable Jump Height', () => {
        test('should have reduced jump height when button released early', () => {
            player.setGrounded(true);
            player.jump();
            player.releaseJump();

            const jumpVy = Math.abs(player.vy);
            expect(jumpVy).toBeGreaterThan(0);
            expect(jumpVy).toBeLessThanOrEqual(player.jumpForce);
        });

        test('should maintain full jump height when button held', () => {
            player.setGrounded(true);
            player.jump();

            expect(player.vy).toBe(-player.jumpForce);
        });
    });

    describe('Gravity and Physics', () => {
        test('should apply gravity when airborne', () => {
            player.setGrounded(false);
            const initialVy = player.vy;

            player.update(0.1);

            expect(player.vy).toBeGreaterThan(initialVy);
        });

        test('should not apply gravity when grounded', () => {
            player.setGrounded(true);
            player.update(0.1);

            expect(player.vy).toBe(0);
        });

        test('should apply vertical velocity to position', () => {
            player.setGrounded(false);
            player.vy = 100;
            const initialY = player.y;

            player.update(0.1);

            expect(player.y).toBeGreaterThan(initialY);
        });

        test('should apply horizontal velocity to position', () => {
            player.inputState.right = true;
            const initialX = player.x;

            player.update(0.1);

            expect(player.x).toBeGreaterThan(initialX);
        });
    });

    describe('Collision and Damage', () => {
        test('should mark as dead when taking damage', () => {
            expect(player.isDead).toBe(false);

            // Take damage 3 times to reach health = 0
            player.takeDamage();
            player.gameTime += 1100; // Reset invulnerability
            player.update(player.gameTime);
            player.takeDamage();
            player.gameTime += 1100;
            player.update(player.gameTime);
            player.takeDamage();

            expect(player.isDead).toBe(true);
        });

        test('should update animation to dead state when hit', () => {
            player.setGrounded(true);

            // Take damage 3 times to die
            player.takeDamage();
            player.gameTime += 1100;
            player.update(player.gameTime);
            player.takeDamage();
            player.gameTime += 1100;
            player.update(player.gameTime);
            player.takeDamage();
            player.update(0.01);

            expect(player.animationState).toBe('dead');
        });

        test('should not take multiple damages', () => {
            // First damage taken
            expect(player.takeDamage()).toBe(true);
            expect(player.health).toBe(2);
            
            // Invulnerability prevents second damage
            expect(player.takeDamage()).toBe(false);
            expect(player.health).toBe(2);
        });

        test('should not update when dead', () => {
            player.isDead = true;
            const initialY = player.y;

            player.update(0.1);

            expect(player.y).toBe(initialY);
        });
    });

    describe('Respawning', () => {
        test('should respawn at respawn position when falling too far', () => {
            player.y = player.respawnY + 700;

            player.update(0.1);

            expect(player.x).toBe(player.respawnX);
            expect(player.y).toBe(player.respawnY);
        });

        test('should reset velocity on respawn', () => {
            player.vx = 100;
            player.vy = 200;
            player.y = player.respawnY + 700;

            player.update(0.1);

            expect(player.vx).toBe(0);
            expect(player.vy).toBe(0);
        });

        test('should reset animation state to idle on respawn', () => {
            player.animationState = 'running';
            player.y = player.respawnY + 700;

            player.update(0.1);

            expect(player.animationState).toBe('idle');
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
            expect(player.inputState.left).toBe(false);

            player.setInput('left', true);

            expect(player.inputState.left).toBe(true);
        });

        test('should set right input', () => {
            expect(player.inputState.right).toBe(false);

            player.setInput('right', true);

            expect(player.inputState.right).toBe(true);
        });

        test('should unset left input', () => {
            player.setInput('left', true);
            expect(player.inputState.left).toBe(true);

            player.setInput('left', false);

            expect(player.inputState.left).toBe(false);
        });

        test('should unset right input', () => {
            player.setInput('right', true);
            expect(player.inputState.right).toBe(true);

            player.setInput('right', false);

            expect(player.inputState.right).toBe(false);
        });
    });

    describe('Health System', () => {
        test('should start with 3 health', () => {
            expect(player.health).toBe(3);
            expect(player.maxHealth).toBe(3);
        });

        test('should lose health when taking damage', () => {
            const initialHealth = player.health;

            player.takeDamage();

            expect(player.health).toBe(initialHealth - 1);
        });

        test('should not take damage when invincible', () => {
            player.isInvincible = true;
            const initialHealth = player.health;

            player.takeDamage();

            expect(player.health).toBe(initialHealth);
        });

        test('should become invincible after taking damage', () => {
            player.gameTime = 0;
            player.takeDamage();

            expect(player.isInvincible).toBe(true);
        });

        test('should regain vulnerability after invulnerability duration', () => {
            player.gameTime = 0;
            player.takeDamage();
            expect(player.isInvincible).toBe(true);

            player.gameTime = player.invulnerabilityDuration + 100;
            player.update(player.gameTime);

            expect(player.isInvincible).toBe(false);
        });

        test('should heal player', () => {
            player.health = 1;

            player.heal(2);

            expect(player.health).toBe(3);
        });

        test('should not exceed max health when healing', () => {
            player.health = 2;

            player.heal(5);

            expect(player.health).toBe(player.maxHealth);
        });

        test('should flash when invincible', () => {
            player.gameTime = 0;
            player.takeDamage();

            expect(player.isFlashing()).toBe(true);
        });
    });

    describe('Rendering', () => {
        test('should render without crashing if no context provided', () => {
            expect(() => player.render(null)).not.toThrow();
        });

        test('should render placeholder if no graphics provided', () => {
            const mockCtx = {
                save: jest.fn(),
                translate: jest.fn(),
                scale: jest.fn(),
                restore: jest.fn(),
                fillRect: jest.fn(),
                fillStyle: '#FF0000',
                strokeStyle: '#000000',
                beginPath: jest.fn(),
                arc: jest.fn(),
                stroke: jest.fn(),
            };

            player.render(mockCtx);

            expect(mockCtx.save).toHaveBeenCalled();
            expect(mockCtx.restore).toHaveBeenCalled();
        });

        test('should flip sprite when facing left', () => {
            const mockCtx = {
                save: jest.fn(),
                translate: jest.fn(),
                scale: jest.fn(),
                restore: jest.fn(),
                fillRect: jest.fn(),
                fillStyle: '#FF0000',
                strokeStyle: '#000000',
                beginPath: jest.fn(),
                arc: jest.fn(),
                stroke: jest.fn(),
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
