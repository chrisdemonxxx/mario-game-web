class Player {
    constructor(x, y, canvas) {
        this.x = x;
        this.y = y;
        this.canvas = canvas;
        this.velocityX = 0;
        this.velocityY = 0;
        this.health = 3;
        this.width = 32;
        this.height = 32;
        this.gravity = 0.5;
        this.terminalVelocity = 15;
    }

    moveLeft() {
        this.velocityX = -3;
    }

    moveRight() {
        this.velocityX = 3;
    }

    jump() {
        this.velocityY = -10;
    }

    update() {
        // Apply gravity
        this.velocityY += this.gravity;
        
        // Cap terminal velocity
        if (this.velocityY > this.terminalVelocity) {
            this.velocityY = this.terminalVelocity;
        }
        
        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Stop moving if no input
        if (Math.abs(this.velocityX) > 0) {
            this.velocityX *= 0.9;
        }
        
        // Boundary check
        if (this.x < 0) {
            this.x = 0;
        }
    }

    takeDamage() {
        this.health = Math.max(0, this.health - 1);
    }

    checkCollision(box1, box2) {
        return box1.x < box2.x + box2.width &&
               box1.x + box1.width > box2.x &&
               box1.y < box2.y + box2.height &&
               box1.y + box1.height > box2.y;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Player };
}
