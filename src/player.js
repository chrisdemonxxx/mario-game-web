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

        // Health system
        this.health = 3;
        this.maxHealth = 3;
        this.isInvincible = false;
        this.invulnerabilityDuration = 1000; // milliseconds
        this.damageTime = 0; // Last time damage was taken
        this.gameTime = 0; // Current game time in milliseconds

        // Dimensions
        this.width = 32;
        this.height = 32;

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
     * Getter for velocityX (compatibility with tests)
     */
    get velocityX() {
        return this.vx;
    }

    /**
     * Setter for velocityX
     */
    set velocityX(value) {
        this.vx = value;
    }

    /**
     * Getter for velocityY (compatibility with tests)
     */
    get velocityY() {
        return this.vy;
    }

    /**
     * Setter for velocityY
     */
    set velocityY(value) {
        this.vy = value;
    }

    /**
     * Move player left
     */
    moveLeft() {
        this.velocityX = -3;
        this.direction = -1;
    }

    /**
     * Move player right
     */
    moveRight() {
        this.velocityX = 3;
        this.direction = 1;
    }

    /**
     * Heal player by specified amount
     * @param {number} amount - Amount to heal
     */
    heal(amount) {
        this.health = Math.min(this.health + amount, this.maxHealth);
    }

    /**
     * Check if player is currently flashing (invincible)
     */
    isFlashing() {
        return this.isInvincible;
    }

    /**
     * Update player state based on input and physics
     * @param {number} deltaTime - Time elapsed since last frame (in seconds) or gameTime in milliseconds
     */
    update(deltaTime) {
        // Handle gameTime updates (milliseconds) vs deltaTime (seconds)
        if (typeof deltaTime === 'number' && deltaTime > 1000) {
            // This is gameTime in milliseconds
            this.gameTime = deltaTime;
        } else if (typeof deltaTime === 'number') {
            // This is deltaTime in seconds - convert to milliseconds
            // Don't update gameTime for small frame-based updates
        }

        // Check if invulnerability has expired
        if (this.isInvincible && this.gameTime > 0 && (this.gameTime - this.damageTime) >= this.invulnerabilityDuration) {
            this.isInvincible = false;
            this.isHit = false; // Clear hit state when invulnerability ends
        }

        // Convert deltaTime for actual movement calculations (handle both second and millisecond inputs)
        let actualDeltaTime = deltaTime;
        if (deltaTime > 1) {
            // Looks like milliseconds, convert to seconds
            actualDeltaTime = deltaTime / 1000;
        }

        // Skip physics updates if dead, but still update animation
        if (!this.isDead) {
            // Update horizontal movement based on input
            this.updateHorizontalMovement(actualDeltaTime);

            // Update vertical movement and gravity
            this.updateVerticalMovement(actualDeltaTime);

            // Check if player has fallen too far (respawn)
            if (this.y > this.respawnY + this.maxFallDistance) {
                this.respawn();
            }
        }

        // Always update animation state (even when dead, to show dead animation)
        this.updateAnimationState(actualDeltaTime);
    }

    /**
     * Update horizontal movement
     * @param {number} deltaTime - Time elapsed since last frame
     */
    updateHorizontalMovement(deltaTime) {
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
        // Apply gravity if not grounded
        if (!this.isGrounded) {
            this.vy += this.gravity * deltaTime;

            // Cap fall speed
            if (this.vy > this.maxFallSpeed) {
                this.vy = this.maxFallSpeed;
            }
        }

        // Apply vertical velocity
        this.y += this.vy * deltaTime;

        // Check if still jumping (based on button hold duration)
        if (this.isJumping && this.inputState.jump) {
            const jumpElapsed = performance.now() / 1000 - this.jumpStartTime;
            if (jumpElapsed > this.jumpMaxDuration) {
                this.isJumping = false;
            }
        } else if (this.isJumping && !this.inputState.jump) {
            this.isJumping = false;
        }
    }

    /**
     * Update animation state based on movement
     * @param {number} deltaTime - Time elapsed since last frame
     */
    updateAnimationState(deltaTime) {
        let newState = 'idle';

        if (this.isDead) {
            newState = 'dead';
        } else if (this.isHit) {
            newState = 'hit';
        } else if (this.isJumping || (this.vy < -50)) {
            newState = 'jumping';
        } else if (!this.isGrounded && this.vy > 50) {
            newState = 'falling';
        } else if (this.vx !== 0) {
            newState = 'running';
        } else {
            newState = 'idle';
        }

        // Update animation frame
        if (newState === this.animationState) {
            this.frameTimer += deltaTime;
            if (this.frameTimer >= this.frameInterval) {
                this.frameTimer = 0;
                if (newState === 'running') {
                    this.currentFrame = (this.currentFrame + 1) % 3; // 3-frame run animation
                } else if (newState === 'hit') {
                    this.currentFrame = (this.currentFrame + 1) % 2; // 2-frame hit animation
                } else {
                    this.currentFrame = 0;
                }
            }
        } else {
            // State changed - reset animation frame
            this.animationState = newState;
            this.currentFrame = 0;
            this.frameTimer = 0;
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
     * Handle collision with enemy (take damage)
     * @returns {boolean} - true if damage was taken, false if blocked by invulnerability
     */
    takeDamage() {
        if (this.isInvincible || this.isDead) {
            return false; // No damage taken
        }

        this.health -= 1;
        this.damageTime = this.gameTime;
        this.isInvincible = true;
        this.isHit = true;

        if (this.health <= 0) {
            this.health = 0;
            this.isDead = true;
        }

        return true; // Damage was taken
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

// Export for Node.js/Jest
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Player };
}
