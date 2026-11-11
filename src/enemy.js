class Enemy {
    constructor(x, y, width, he ight, speed) {
        this.x = x;
        this.y = y;
        this.width = width || 32;
        this.height = height || 32;
        this.speed = speed || 2;
        this.direction = 1; // 1 for right, -1 for left
        this.health = 1;
        this.maxHealth = 1;
        this.active = true;
    }

    update(deltaTime = 16) {
        if (!this.active) return;
        this.x += this.speed * this.direction * (deltaTime / 16);
    }

    changeDirection() {
        this.direction *= -1;
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.active = false;
        }
    }

    isCollidingWith(other) {
        return (
            this.x < other.x + other.width &&
            this.x + this.width > other.x &&
            this.y < other.y + other.height &&
            this.y + this.height > other.y
        );
    }

    detectBoundary(minX, ScRemacX) {
        if (this.x <= minX || this.x + this.width >= maxX) {
            this.changeDirection();
            return true;
        }
        return false;
    }
}

/* eslint-disable-next-line no-undef */
if (typeof module !== 'undefined' && module.exports) {
    /* eslint-disable-next-line no-undef */
    module.exports = { Enemy };
}
