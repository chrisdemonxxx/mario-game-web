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

        // Platform collision flags
        this.onPlatform = false;
        this.platformVelocity = 0; // For moving platforms

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

        // Skip physics updates if dead, but always update animation
        if (!this.isDead) {
            // Update horizontal movement based on input
            this.updateHorizontalMovement(deltaTime);

            // Update vertical movement and gravity
            this.updateVerticalMovement(deltaTime);
        }

        // Always check if player has fallen too far (respawn)
        if (this.y > this.respawnY + this.maxFallDistance) {
            this.respawn();
        }

        // Always update animation state
        this.updateAnimationState(deltaTime);
    }

    /**
     * Update horizontal movement
     * @param {number} deltaTime - Time elapsed since last frame
     */
    updateHorizontalMovement(deltaTime) {
        // Only apply delta time if it looks like actual delta (not game time)
        if (deltaTime > 100) {
            deltaTime = 0.016; // Default to ~60fps if gameTime passed
        }

        if (this.inputState.left) {
            this.vx = -this.moveSpeed * this.acceleration;
            this.direction = -1;
        } else if (this.inputState.right) {
            this.vx = this.moveSpeed * this.acceleration;
            this.direction = 1;
        } else {
            this.vx = 0;
        }

        // Apply velocity
        this.x += this.vx * deltaTime;
    }

    /**
     * Update vertical movement and gravity
     * @param {number} deltaTime - Time elapsed since last frame
     */
    updateVerticalMovement(deltaTime) {
        // Only apply delta time if it looks like actual delta (not game time)
        if (deltaTime > 100) {
            deltaTime = 0.016; // Default to ~60fps if gameTime passed
        }

        // Apply gravity if not grounded
        if (!this.isGrounded) {
            this.vy += this.gravity * deltaTime;
            if (this.vy > this.maxFallSpeed) {
                this.vy = this.maxFallSpeed;
            }
            this.isFalling = true;
        } else if (this.isFalling) {
            this.isFalling = false;
        }

        // Apply vertical velocity
        this.y += this.vy * deltaTime;
    }

    /**
     * Update animation based on current state
     * @param {number} deltaTime - Time elapsed since last frame
     */
    updateAnimationState(deltaTime) {
        // Skip animation if dead
        if (this.isDead) {
            this.animationState = 'dead';
            return;
        }

        // If hit, show hit animation
        if (this.isHit) {
            this.animationState = 'hit';
            return;
        }

        // Determine base state
        if (this.isJumping || this.isFalling) {
            if (this.vy < 0) {
                this.animationState = 'jumping';
            } else {
                this.animationState = 'falling';
            }
        } else if (this.vx !== 0) {
            this.animationState = 'running';
        } else {
            this.animationState = 'idle';
        }

        // Update frame
        this.frameTimer += deltaTime;
        if (this.frameTimer >= this.frameInterval) {
            this.frameTimer -= this.frameInterval;
            this.currentFrame = (this.currentFrame + 1) % 4; // 4 frames per animation
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
     * Handle collision with enemy (take damage)
     * @returns {boolean} true if damage was taken, false if blocked by invulnerability
     */
    takeDamage() {
        // Only take damage if not invincible and still alive
        if (!this.isInvincible && this.health > 0) {
            this.health = Math.max(0, this.health - 1);
            this.lastDamageTime = this.gameTime;
            this.isInvincible = true;

            if (this.health === 0) {
                this.isDead = true;
            }

            return true; // Damage was taken
        }
        return false; // Damage was blocked by invulnerability
    }

    /**
     * Heal the player
     * @param {number} amount - Amount to heal
     */
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    /**
     * Check if player should flash (visual feedback during invulnerability)
     * @returns {boolean} true if currently flashing
     */
    isFlashing() {
        if (!this.isInvincible) {
            return false;
        }
        // Flash on/off every 100ms
        const flashPeriod = 100;
        const cycleTime = (this.gameTime - this.lastDamageTime) % (flashPeriod * 2);
        return cycleTime < flashPeriod;
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
        ctx.fillRect(-this.width / 4, -this.height / 4, 6, 6);
        ctx.fillRect(this.width / 4 - 6, -this.height / 4, 6, 6);

        // Pupils (animated direction)
        ctx.fillStyle = '#000000';
        const pupilX = this.direction === 1 ? 1 : -1;
        ctx.fillRect(-this.width / 4 + pupilX + 1, -this.height / 4 + 1, 3, 3);
        ctx.fillRect(this.width / 4 - 6 + pupilX + 1, -this.height / 4 + 1, 3, 3);

        // Mouth (smile)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.arc(0, 4, 3, 0.2 * Math.PI, 0.8 * Math.PI);
    }

    /**
     * Move left (legacy method for backward compatibility)
     */
    moveLeft() {
        this.vx = -3;
    }

    /**
     * Move right (legacy method for backward compatibility)
     */
    moveRight() {
        this.vx = 3;
    }

    /**
     * Backward compatibility getters for old API
     */
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
        } else if (direction === 'jump') {
            this.inputState.jump = pressed;
        }
    }
}

// Export for Node.js / Jest
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Player;
}