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

    // Health system
    this.health = 3;
    this.maxHealth = 3;
    this.lastDamageTime = -this.invulnerabilityDuration;
    this.invulnerabilityDuration = 2000;  // milliseconds
    this.isInvincible = false;
    this.gameTime = 0;
  }

  /**
   * Update player state based on input and physics
   * @param {number} deltaTime - Time elapsed since last frame (in seconds)
   */
  update(deltaTime) {
    if (this.isDead) return;

    // Update horizontal movement based on input
    this.updateHorizontalMovement(deltaTime);

    // Update vertical movement and gravity
    this.updateVerticalMovement(deltaTime);

    // Update animation state
    this.updateAnimationState(deltaTime);

    // Check if player has fallen too far (respawn)
    if (this.y > this.respawnY + this.maxFallDistance) {
      this.respawn();
    }
  }

  /**
   * Update horizontal movement
   * @param {number} deltaTime - Time elapsed since last frame
   */
  updateHorizontalMovement(deltaTime) {
    const targetVx = 0;

    if (this.inputState.left) {
      this.vx = -this.moveSpeed * this.acceleration;
      this.direction = -1;
    } else if (this.inputState.right) {
      this.vx = this.moveSpeed * this.acceleration;
      this.direction = 1;
    } else {
      this.vx = 0;
    }

    this.x += this.vx * deltaTime;
  }

  /**
   * Update vertical movement and jumping
   * @param {number} deltaTime - Time elapsed since last frame
   */
  updateVerticalMovement(deltaTime) {
    // Handle input for jump
    if (this.inputState.jump && this.isGrounded) {
      this.vy = -this.jumpForce;
      this.isGrounded = false;
      this.isJumping = true;
    }

    // Apply gravity
    if (!this.isGrounded) {
      this.vy += this.gravity * deltaTime;
      if (this.vy > this.maxFallSpeed) {
        this.vy = this.maxFallSpeed;
      }
    }

    // Apply vertical velocity
    this.y += this.vy * deltaTime;

    // Simple ground collision (assuming ground at y = 500)
    const groundY = 500;
    if (this.y >= groundY) {
      this.y = groundY;
      this.vy = 0;
      this.isGrounded = true;
      this.isJumping = false;
    }
  }

  /**
   * Update animation state based on player's current movement and state
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
      // State changed
      this.animationState = newState;
      this.currentFrame = 0;
      this.frameTimer = 0;
    }
  }

  /**
   * Apply damage to the player
   * @param {number} damage - Amount of damage to apply
   */
  takeDamage(damage) {
    if (this.isInvincible) return false;
    this.health -= damage;
    this.isHit = true;
    this.lastDamageTime = this.gameTime;
    this.isInvincible = true;
    if (this.health <= 0) {
      this.isDead = true;
      this.isHit = true;
    }
    return true;
  }

  /**
   * Heal the player
   * @param {number} amount - Amount to heal
   */
  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
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
    this.isDead = false;
    this.isHit = false;
    this.health = this.maxHealth;
    this.isInvincible = false;
  }

  /**
   * Move player left (backward compatibility method)
   */
  moveLeft() {
    this.inputState.left = true;
  }

  /**
   * Move player right (backward compatibility method)
   */
  moveRight() {
    this.inputState.right = true;
  }

  /**
   * Get velocity X (for test compatibility)
   */
  get velocityX() {
    return this.vx;
  }

  /**
   * Get velocity Y (for test compatibility)
   */
  get velocityY() {
    return this.vy;
  }

  /**
   * Stop horizontal movement
   */
  stopHorizontal() {
    this.inputState.left = false;
    this.inputState.right = false;
    this.vx = 0;
  }

  /**
   * Jump - initiate a jump
   */
  jump() {
    this.inputState.jump = true;
  }

  /**
   * Release jump button
   */
  releaseJump() {
    this.inputState.jump = false;
  }

  /**
   * Check if player is on the ground
   * @returns {boolean} Whether player is grounded
   */
  isGrounded() {
    return this.isGrounded;
  }

  /**
   * Render the player
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    if (this.graphics) {
      this.graphics.render(ctx, this.x, this.y, this.direction, this.animationState, this.currentFrame);
    } else {
      this.renderPlaceholder(ctx);
    }
  }

  /**
   * Render placeholder character
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
