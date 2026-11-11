const Physics = require('./physics');

class Enemy {
  constructor(x, y, minX, maxX) {
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 32;
    this.minX = minX;
    this.maxX = maxX;
    this.dirX = 1;
    this.speed = 2;
    this.frameIndex = 0;
  }

  update() {
    this.x += this.dirX * this.speed;

    if (this.x <= this.minX || this.x >= this.maxX) {
      this.dirX *= -1;
    }

    this.frameIndex++;
  }

  checkCollision(player) {
    return Physics.checkAABB(this, player);
  }
}

module.exports = Enemy;
