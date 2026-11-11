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

    /**
     * Update player state based on input and physics
     * @param {number} deltaTime - Time elapsed since last frame (in seconds or game time)
     */
    update(deltaTime) {
        // Handle both delta time (seconds) and game time (milliseconds for test compatibility)
        if (typeof deltaTime === 'number') {
            // If deltaTime looks like a game time (too large to be delta), use it as gameTime
            if (deltaTime > 100) {
                this.gameTime = deltaTime;
            } else if (deltaTime > 0) {
                // Regular delta time in seconds
                this.gameTime += deltaTime * 1000;
            }
        }

        // Update invulnerability state
        if (this.lastDamageTime > 0) {
            const timeSinceDamage = this.gameTime - this.lastDamageTime;
            if (timeSinceDamage < this.invulnerabilityDuration) {
                this.isInvincible = true;
            } else {
                this.isInvincible = false;
                this.lastDamageTime = 0;
            }
        } else {
            this.isInvincible = false;
        }

        // Apply velocity to position
        this.x += this.vx;
        this.y += this.vy;

        // Apply gravity
        if (!this.isGrounded) {
            this.vy += this.gravity * 0.016; // 0.016 ≈ 1/60 frame time
            if (this.vy > this.maxFallSpeed) {
                this.vy = this.maxFallSpeed;
            }
        }
    }

    /**
     * Initiate jump
     */
    jump() {
        if (!this.isGrounded) return; // Cannot jump while airborne

        this.vy = -this.jumpForce;
        this.isGrounded = false;
        this.isJumping = true;
        this.jumpStartTime = performance.now() / 1000;
        this.inputState.jump = true;
    }

    /**
     * Release jump button (for variable jump height)
     */
    releaseJump() {
        this.inputState.jump = false;
        if (this.isJumping && this.vy < 0) {
            this.isJumping = false;
        }
    }

    /**
     * Set player as grounded (touching platform)
     */
    setGrounded(isGrounded) {
        this.isGrounded = isGrounded;
        if (isGrounded) {
            this.vy = 0;
            this.isFalling = false;
        }
    }

    /**
     * Move player left
     */
    moveLeft() {
        this.vx = -3;
    }

    /**
     * Move player right
     */
    moveRight() {
        this.vx = 3;
    }

    /**
     * Get velocity X (for test compatibility)
     */
    get velocityX() {
        return this.vx;
    }

    /**
     * Set velocity X (for test compatibility)
     */
    set velocityX(value) {
        this.vx = value;
    }

    /**
     * Get velocity Y (for test compatibility)
     */
    get velocityY() {
        return this.vy;
    }

    /**
     * Set velocity Y (for test compatibility)
     */
    set velocityY(value) {
        this.vy = value;
    }

    /**
     * Handle collision with enemy (take damage)
     * @returns {boolean} true if damage was taken, false if blocked by invulnerability
     */
    takeDamage() {
        // Only take damage if not invincible and still alive
        if (!this.isInvincible && this.health > 0) {
            this.health -= 1;
            this.lastDamageTime = this.gameTime;
            this.isInvincible = true;
            if (this.health <= 0) {
                this.isDead = true;
                this.isHit = true;
            }
            return true;
        }
        return false;
    }

    /**
     * Check if player should flash (invulnerability visual)
     * @returns {boolean} true if player should be invisible this frame
     */
    isFlashing() {
        if (!this.isInvincible) {
            return false;
        }
        // Flash every 100ms
        const flashInterval = 100;
        const timeSinceDamage = this.gameTime - this.lastDamageTime;
        return Math.floor(timeSinceDamage / flashInterval) % 2 === 0;
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
        } else {
            ctx.fillStyle = '#0000FF';
            ctx.fillRect(-this.width / 4 - 4, -2, 4, 4);
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

// Export for Node.js/Jest
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Player };
}
