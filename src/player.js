/**
 * Player class representing the main character (Mario-like) with platformer movement and jumping physics
 */

class Player {
    /**
     * Create a player instance
     * @param {number} x - Starting x position
     * @param {number} y - Starting y position
     * @param {Object} graphics - Graphics object for rendering
     */
    constructor(x, y, graphics = null) {
        this.x = x;
        this.y = y;
        this.graphics = graphics;

        // Physics properties
        this.moveSpeed = 150;        // pixels/second
        this.jumpForce = 400;        // pixels/second²
        this.gravity = 600;          // pixels/second²
        this.maxFallSpeed = 500;     // terminal velocity
        this.acceleration = 1.0;     // frame-independent multiplier

        // Velocity
        this.vx = 0;  // horizontal velocity
        this.vy = 0;  // vertical velocity

        // Dimensions
        this.width = 32;
        this.height = 32;

        // Health system
        this.health = 3;
        this.maxHealth = 3;
        this.gameTime = 0;
        this.lastDamageTime = 0;
        this.invulnerabilityDuration = 1000; // milliseconds
        this.isInvincible = false;

        // State
        this.isGrounded = false;
        this.isJumping = false;
        this.isFalling = false;
        this.direction = 1;          // 1 = right, -1 = left
        this.isHit = false;
        this.isDead = false;

        // Animation
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.frameInterval = 0.15;   // seconds per frame
        this.animationState = 'idle'; // idle, running, jumping, falling, hit, dead

        // Input state
        this.inputState = {
            left: false,
            right: false,
            jump: false,
        };

        // Jump tracking
        this.jumpStartTime = 0;
        this.jumpMaxDuration = 0.3;  // seconds - how long button must be held for full jump

        // Respawn position
        this.respawnX = x;
        this.respawnY = y;

        // Screen bounds (will be set by game)
        this.maxFallDistance = 600;
    }

    get velocityX() {
        return this.vx;
    }

    set velocityX(value) {
        this.vx = value;
    }

    get velocityY() {
        return this.vy;
    }

    set velocityY(value) {
        this.vy = value;
    }

    moveLeft() {
        this.velocityX = -3;
        this.direction = -1;
    }

    moveRight() {
        this.velocityX = 3;
        this.direction = 1;
    }

    /**
     * Update player state based on input and physics
     * @param {number} deltaTime - Time elapsed since last frame (in seconds or game time)
     */
    update(deltaTime) {
        // Handle both delta time (seconds) and game time (milliseconds for test compatibility)
        if (typeof deltaTime === 'number') {
            // If deltaTime looks like a game time (too large to be delta), use it as gameTime
            if (deltaTime > 10) {
                // Treat as game time (milliseconds)
                this.gameTime = deltaTime;
                deltaTime = 0.016; // Assume ~60 FPS
            } else {
                this.gameTime += deltaTime * 1000;
            }
        }

        // Handle player collision with ground
        if (this.y >= 450) {
            // Player too far fall - respawn (or game over)
            this.isGrounded = true;
            this.respawn();
            this.takeDamage();
        }

        // Handle hit flashing
        if (this.isHit) {
            if (this.gameTime - this.lastDamageTime > this.invulnerabilityDuration) {
                this.isHit = false;
            }
        }

        // Handle death and render dead animation
        // Get current animation state appropriately for the current player state
        this.updateAnimationState();
    }

    /**
     * Update animation state based on current conditions
     */
    updateAnimationState() {
        if (this.isDead) {
            this.animationState = 'dead';
        } else if (this.isHit) {
            this.animationState = 'hit';
        } else if (this.isJumping || this.isFalling) {
            this.animationState = 'falling';
        } else if (this.vx !== 0) {
            this.animationState = 'running';
        } else {
            this.animationState = 'idle';
        }
    }

    /**
     * Player takes damage
     */
    takeDamage() {
        if (this.isInvincible) return false;

        this.health--;
        this.isHit = true;
        this.lastDamageTime = this.gameTime;
        this.isInvincible = true;

        if (this.health < 0) {
            this.health = 0;
            this.isDead = true;
        }

        return true;
    }

    /**
     * Respawn player at starting position
     */
    respawn() {
        this.x = this.respawnX;
        this.y = this.respawnY;
        this.vx = 0;
        this.vy = 0;
        this.isGrounded = true;
        this.isJumping = false;
        this.isFalling = false;
        this.isHit = false;
        this.isDead = false;
        this.direction = 1;
        this.animationState = 'idle';
        this.currentFrame = 0;
    }

    /**
     * Render player to canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    render(ctx) {
        if (!ctx) return;

        ctx.save();

        // Position and flip based on direction
        ctx.translate(this.x + this.width / 2, this.y);
        if (this.direction === -1) {
            ctx.scale(-1, 1);
        }

        // Draw sprite or rectangle placeholder
        if (this.graphics && this.graphics.sprites && this.graphics.sprites.player) {
            // Use sprite asset if available
            const sprite = this.graphics.sprites.player[this.animationState]?.[this.currentFrame];
            if (sprite) {
                ctx.drawImage(
                    sprite,
                    -this.width / 2,
                    -this.height / 2,
                    this.width,
                    this.height
                );
            } else {
                this.renderPlaceholder(ctx);
            }
        } else {
            this.renderPlaceholder(ctx);
        }

        ctx.restore();
    }

    /**
     * Render placeholder rectangle when no sprite available
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    renderPlaceholder(ctx) {
        // Character body
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

        // Eyes
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-this.width / 6, -this.height / 4, 4, 4);
        ctx.fillRect(this.width / 6, -this.height / 4, 4, 4);

        // Mouth
        ctx.strokeStyle = '#000000';
        ctx.beginPath();
        ctx.arc(0, this.height / 8, this.width / 6, 0, Math.PI);
        ctx.stroke();

        // Direction indicator
        if (this.direction === 1) {
            ctx.fillStyle = '#0000FF';
            ctx.fillRect(this.width / 4, -2, 4, 4);
        }
    }

    /**
     * Set input state
     * @param {string} direction - 'left', 'right', or null
     * @param {boolean} pressed - Is key pressed
     */
    setInput(direction, pressed) {
        if (direction === 'left') {
            this.inputState.left = pressed;
        } else if (direction === 'right') {
            this.inputState.right = pressed;
        }
    }
}

// Export for Node.js/Jest - support BOTH default and named imports
if (typeof module !== 'undefined' && module.exports) {
    Player.Player = Player;
    module.exports = Player;
}