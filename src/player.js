const Physics = require('./physics');

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 32;
    this.vx = 0;
    this.vy = 0;
    this.health = 3;
    this.maxHealth = 3;
    this.onGround = false;
    this.invulnerable = false;
    this.invulnTimer = 0;
  }

  moveLeft() {
    this.vx = -5;
  }

  moveRight() {
    this.vx = 5;
  }

  stop() {
    this.vx = 0;
  }

  jump() {
    if (this.onGround) {
      this.vy = -12;
      this.onGround = false;
    }
  }

  takeDamage() {
    if (!this.invulnerable && this.health > 0) {
      this.health--;
      this.invulnerable = true;
      this.invulnTimer = 120;
    }
  }

  update() {
    Physics.applyGravity(this);
    this.x += this.vx;
    this.y += this.vy;

    if (this.invulnerable) {
      this.invulnTimer--;
      if (this.invulnTimer <= 0) {
        this.invulnerable = false;
      }
    }

    if (this.y > 1000) {
      this.health = 0;
    }
  }

  isDead() {
    return this.health <= 0;
  }
}

module.exports = Player;
