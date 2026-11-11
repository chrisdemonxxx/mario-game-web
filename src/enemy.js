class Enemy {
    constructor(x, y, type, canvas) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.canvas = canvas;
        this.velocityX = 2;
        this.patrolDistance = 150;
        this.startX = x;
        this.width = 32;
        this.height = 32;
        this.animationFrame = 0;
    }

    update() {
        // Move
        this.x += this.velocityX;
        
        // Check patrol boundaries
        const distance = Math.abs(this.x - this.startX);
        if (distance > this.patrolDistance) {
            this.velocityX *= -1;
        }
        
        // Update animation
        this.animationFrame = (this.animationFrame + 1) % 4;
    }

    checkCollision(player) {
        return this.x < player.x + player.width &&
               this.x + this.width > player.x &&
               this.y < player.y + player.height &&
               this.y + this.height > player.y;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Enemy };
}
