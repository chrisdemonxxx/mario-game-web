class Player {
    constructor(x, y, canvas) {
        this.x = x;
        this.y = y;
        this.canvas = canvas;
        this.velocityX = 0;
        this.velocityY = 0;
        this.health = 3;
        this.maxHealth = 3;
        this.width = 32;
        this.height = 32;
        this.gravity = 0.5;
        this.terminalVelocity = 15;
        // Invulnerability system
        this.lastDamageTime = 0;
        this.invulnerabilityDuration = 1000;
        this.isInvincible = false;
        this.isDead = false;
        this.gameTime = 0;
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

    update(gameTime) {
        this.gameTime = gameTime || 0;

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

        // Check if player fell off bottom
        if (this.canvas && this.y > this.canvas.height) {
            this.takeDamage();
        }
    }

    takeDamage() {
        if (!this.isInvincible && this.health > 0) {
            this.health = Math.max(0, this.health - 1);
            this.lastDamageTime = this.gameTime;
            this.isInvincible = true;

            if (this.health === 0) {
                this.isDead = true;
            }
            return true;
        }
        return false;
    }

    takeInstantDeath() {
        this.health = 0;
        this.isDead = true;
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    isFlashing() {
        if (!this.isInvincible) {
            return false;
        }
        const flashInterval = 100;
        const timeSinceDamage = this.gameTime - this.lastDamageTime;
        return Math.floor(timeSinceDamage / flashInterval) % 2 === 0;
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
