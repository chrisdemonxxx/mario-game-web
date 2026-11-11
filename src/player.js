class Player {
    constructor(x, y, width = 20, height = 20) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 5;
        this.jumpPower = 15;
        this.gravity = 0.6;
        this.isJumping = false;
        this.isGrounded = false;
        this.maxFallSpeed = 10;
    }

    moveLeft() {
        this.velocityX = -this.speed;
    }

    moveRight() {
        this.velocityX = this.speed;
    }

    stopMoving() {
        this.velocityX = 0;
    }

    jump() {
        if (this.isGrounded) {
            this.velocityY = -this.jumpPower;
            this.isJumping = true;
            this.isGrounded = false;
        }
    }

    applyGravity() {
        if (!this.isGrounded) {
            this.velocityY += this.gravity;
            if (this.velocityY > this.maxFallSpeed) {
                this.velocityY = this.maxFallSpeed;
            }
        }
        this.y += this.velocityY;
    }

    checkGroundCollision(groundY) {
        if (this.y + this.height >= groundY) {
            this.y = groundY - this.height;
            this.velocityY = 0;
            this.isGrounded = true;
            this.isJumping = false;
        } else {
            this.isGrounded = false;
        }
    }

    update(groundY) {
        this.applyGravity();
        this.x += this.velocityX;
        this.checkGroundCollision(groundY);
    }

    getPosition() {
        return { x: this.x, y: this.y };
    }

    getVelocity() {
        return { x: this.velocityX, y: this.velocityY };
    }

    checkCollision(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
}

// Export for Jest (CommonJS) while staying usable as a plain <script> in the browser.
// eslint-disable-next-line no-undef
if (typeof module !== 'undefined' && module.exports) {
    // eslint-disable-next-line no-undef
    module.exports = { Player };
}