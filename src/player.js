// Player class for Mario Game
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 32;
    this.velX = 0;
    this.velY = 0;
    this.accelX = 0;
    this.onGround = false;
    this.jumping = false;
    this.health = 3;
    this.invulnerable = false;
    this.invulnerableTimer = 0;
    this.coins = 0;
    this.levelsCompleted = 0;
    this.direction = 1; // 1 for right, -1 for left
    this.input = {};
  }

  updateInput(input) {
    this.input = input;
  }

  update(platforms, hazards) {
    // Horizontal movement
    if (this.input.ArrowLeft || this.input.a) {
      this.accelX = -0.5;
      this.direction = -1;
    } else if (this.input.ArrowRight || this.input.d) {
      this.accelX = 0.5;
      this.direction = 1;
    } else {
      this.accelX = 0;
    }

    this.velX += this.accelX;
    this.velX = Math.max(-5, Math.min(5, this.velX)); // Clamp velocity
    this.x += this.velX;

    // Gravity
    this.velY += 0.6; // Gravity constant
    this.velY = Math.min(this.velY, 15); // Terminal velocity
    this.y += this.velY;

    // Platform collision detection
    this.onGround = false;
    if (platforms && platforms.length > 0) {
      for (let platform of platforms) {
        if (this.checkCollision(platform)) {
          if (this.velY > 0) {
            this.y = platform.y - this.height;
            this.velY = 0;
            this.onGround = true;
          }
        }
      }
    }

    // Boundary collision
    if (this.y > 600) {
      this.takeDamage();
      this.respawn();
    }

    // Hazard collision
    if (hazards && hazards.length > 0) {
      for (let hazard of hazards) {
        if (this.checkCollision(hazard)) {
          if (!this.invulnerable) {
            this.takeDamage();
          }
        }
      }
    }

    // Invulnerability timer
    if (this.invulnerable) {
      this.invulnerableTimer--;
      if (this.invulnerableTimer <= 0) {
        this.invulnerable = false;
      }
    }

    // Game over check
    if (this.health <= 0) {
      return 'gameover';
    }
  }

  jump() {
    if (this.onGround) {
      this.velY = -12;
      this.jumping = true;
      this.onGround = false;
    }
  }

  checkCollision(rect) {
    return this.x < rect.x + rect.width &&
           this.x + this.width > rect.x &&
           this.y < rect.y + rect.height &&
           this.y + this.height > rect.y;
  }

  takeDamage() {
    if (!this.invulnerable) {
      this.health--;
      this.invulnerable = true;
      this.invulnerableTimer = 120; // 2 seconds at 60 FPS
    }
  }

  respawn() {
    this.x = 50;
    this.y = 300;
    this.velX = 0;
    this.velY = 0;
  }

  getScore() {
    return (this.coins * 10) + (this.levelsCompleted * 100);
  }

  getBounds() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }
}

module.exports = Player;