// Enemy class for Mario Game
class Enemy {
    constructor(x, y, direction, minX, maxX) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.speed = 2;
        this.direction = direction || 1;
        this.minX = minX || 0;
        this.maxX = maxX || 800;
    }

    // eslint-disable-next-line no-unused-vars
    update(player) {
        // Patrol movement
        this.x += this.speed * this.direction;

        // Check patrol boundaries
        if (this.x <= this.minX || this.x >= this.maxX) {
            this.direction *= -1;
        }
    }

    checkCollision(rect) {
        return this.x < rect.x + rect.width &&
           this.x + this.width > rect.x &&
           this.y < rect.y + rect.height &&
           this.y + this.height > rect.y;
    }

    getBounds() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}

module.exports = Enemy;
