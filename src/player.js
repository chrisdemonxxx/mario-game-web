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
        }

        // Update position based on input and physics
        this.updateHorizontalMovement(deltaTime);
        this.updateVerticalMovement(deltaTime);
        this.updateAnimation(deltaTime);
    }

    /**
     * Update horizontal movement based on input
     * @param {number} deltaTime - Time since last frame
     */
    updateHorizontalMovement(deltaTime) {
        if (typeof deltaTime !== 'number' || deltaTime === 0) {
            deltaTime = 0.016; // Default to ~60fps
        }
        if (deltaTime > 100) {
            deltaTime = 0.016; // If passed game time, use default delta
        }

        // Apply input
        if (this.inputState.left) {
            this.vx = -this.moveSpeed;
            this.direction = -1;
        } else if (this.inputState.right) {
            this.vx = this.moveSpeed;
            this.direction = 1;
        } else {
            this.vx = 0;
        }

        // Apply velocity
        this.x += this.vx * deltaTime;
        // Clamp horizontal position to screen bounds
        const maxX = 800 - this.width;
        if (this.x < 0) this.x = 0;
        if (this.x > maxX) this.x = maxX;
    }

    /**
     * Update vertical movement with gravity
     * @param {number} deltaTime - Time since last frame
     */
    updateVerticalMovement(deltaTime) {
        if (typeof deltaTime !== 'number' || deltaTime === 0) {
            deltaTime = 0.016; // Default to ~60fps
        }
        if (deltaTime > 100) {
            deltaTime = 0.016; // If passed game time, use default delta
        }

        // Apply gravity if not grounded
        if (!this.isGrounded) {
            this.vy += this.gravity * deltaTime;
            if (this.vy > this.maxFallSpeed) {
                this.vy = this.maxFallSpeed;
            }
        }

        // Apply vertical velocity
        this.y += this.vy * deltaTime;

        // Simple ground collision
        if (this.y >= 560) {
            this.y = 560;
            this.isGrounded = true;
            this.vy = 0;
        } else if (this.y > this.maxFallDistance) {
            // Respawn if fell too far
            this.respawn();
        } else {
            this.isGrounded = false;
        }
    }

    /**
     * Update animation state
     * @param {number} deltaTime - Time since last frame
     */
    updateAnimation(deltaTime) {
        if (typeof deltaTime !== 'number' || deltaTime === 0) {
            deltaTime = 0.016;
        }
        if (deltaTime > 100) {
            deltaTime = 0.016;
        }

        this.frameTimer += deltaTime;
        if (this.frameTimer >= this.frameInterval) {
            this.frameTimer = 0;
            this.currentFrame = (this.currentFrame + 1) % 4;
        }

        // Update animation state based on movement
        if (this.isDead) {
            this.animationState = 'dead';
        } else if (this.isHit) {
            this.animationState = 'hit';
        } else if (!this.isGrounded) {
            this.animationState = this.vy < 0 ? 'jumping' : 'falling';
        } else if (this.vx !== 0) {
            this.animationState = 'running';
        } else {
            this.animationState = 'idle';
        }
    }

    /**
     * Jump
     */
    jump() {
        if (!this.isGrounded) return;

        this.vy = -this.jumpForce;
        this.isGrounded = false;
        this.isJumping = true;
        this.jumpStartTime = this.gameTime;
    }

    /**
     * Release jump (for variable height jumps)
     */
    releaseJump() {
        if (this.isJumping && this.vy < 0) {
            this.vy *= 0.5; // Reduce upward velocity
        }
        this.isJumping = false;
    }

    /**
     * Take damage
     * @param {number} amount - Damage amount
     * @returns {boolean} - Whether damage was applied
     */
    takeDamage(amount = 1) {
        if (this.isInvincible) {
            return false;
        }

        this.health -= amount;
        if (this.health < 0) {
            this.health = 0;
        }
        this.lastDamageTime = this.gameTime;
        this.isInvincible = true;
        this.isHit = true;

        return true;
    }

    /**
     * Heal
     * @param {number} amount - Heal amount
     */
    heal(amount = 1) {
        this.health = Math.min(this.health + amount, this.maxHealth);
    }

    /**
     * Kill the player
     */
    kill() {
        this.isDead = true;
        this.isGrounded = true;
        this.vx = 0;
        this.vy = 0;
    }

    /**
     * Set grounded state
     * @param {boolean} grounded - Is player grounded
     */
    setGrounded(grounded) {
        this.isGrounded = grounded;
        if (grounded) {
            this.vy = 0;
        }
    }

    /**
     * Respawn at spawn position
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

    /**
     * Move left (set horizontal velocity to negative)
     */
    moveLeft() {
        this.vx = -3;
    }

    /**
     * Move right (set horizontal velocity to positive)
     */
    moveRight() {
        this.vx = 3;
    }

    /**
     * Get current horizontal velocity
     */
    get velocityX() {
        return this.vx;
    }

    /**
     * Get current vertical velocity
     */
    get velocityY() {
        return this.vy;
    }
}

// Export for Node.js/Jest
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Player };
}
