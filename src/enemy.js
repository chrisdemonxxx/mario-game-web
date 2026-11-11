/**
 * Enemy class representing a basic enemy (Goomba-like) with patrol AI and collision mechanics
 */

class Enemy {
    /**
     * Create an enemy
     * @param {number} x - Starting x position
     * @param {number} y - Starting y position
     * @param {string|Object} typeOrOptions - Enemy type (string) or configuration object
     * @param {Object} graphics - Graphics object (legacy parameter)
     */
    constructor(x, y, typeOrOptions = {}, graphics = null) {
        this.x = x;
        this.y = y;
        this.graphics = graphics;
        
        // Handle both old (type, graphics) and new (options) signatures
        if (typeof typeOrOptions === 'string') {
            // Old signature: new Enemy(x, y, 'goomba', graphics)
            this.type = typeOrOptions;
            this.width = 16;
            this.height = 16;
            this.speed = 80;
            this.patrolDistance = 200;
        } else {
            // New signature: new Enemy(x, y, options)
            const options = typeOrOptions || {};
            this.type = options.type || 'goomba';
            this.width = options.width || 16;
            this.height = options.height || 16;
            this.speed = options.speed || 80;
            this.patrolDistance = options.patrolDistance || 200;
        }
        
        this.direction = 1; // 1 = right, -1 = left
        this.patrolStart = x;
        
        this.state = 'walking'; // 'walking' | 'crushed' | 'dead'
        this.hp = 1; // 1 HP = alive, 0 HP = dead
        this.crushTimer = 0; // Countdown timer for crushed state
        this.crushDuration = 1; // How long crushed state lasts (seconds)
    }

    /**
     * Update enemy position and state
     * @param {number} dt - Delta time in seconds (optional, defaults to 1/60)
     */
    update(dt = 1 / 60) {
        if (this.state === 'walking') {
            // Move in current direction
            this.x += this.direction * this.speed * dt;

            // Check if we've reached patrol boundary
            const distanceFromStart = Math.abs(this.x - this.patrolStart);
            if (distanceFromStart >= this.patrolDistance) {
                // Reverse direction
                this.direction *= -1;
                // Clamp to boundary
                this.x = this.patrolStart + this.direction * this.patrolDistance;
            }
        } else if (this.state === 'crushed') {
            // Count down crush timer
            this.crushTimer -= dt;
            if (this.crushTimer <= 0) {
                this.state = 'dead';
                this.hp = 0;
            }
        }
    }

    /**
     * Check if this enemy collides with another object (legacy method for game.test.js)
     * @param {Object} other - Other object with x, y, width, height properties
     * @returns {boolean} True if colliding
     */
    checkCollision(other) {
        if (!other) return false;
        return this.isCollidingWith(other.x, other.y, other.width, other.height);
    }

    /**
     * Check if this enemy overlaps with another AABB
     * @param {number} x - Other object's x position
     * @param {number} y - Other object's y position
     * @param {number} width - Other object's width
     * @param {number} height - Other object's height
     * @returns {boolean} True if bounding boxes overlap
     */
    isCollidingWith(x, y, width, height) {
        return !(this.x + this.width <= x ||
                 x + width <= this.x ||
                 this.y + this.height <= y ||
                 y + height <= this.y);
    }

    /**
     * Get bounding box for collision detection
     * @returns {Object} Bounding box with x, y, width, height
     */
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    /**
     * Crush the enemy (player jumped on it)
     * Enemy shows crushed state briefly, then becomes dead
     */
    crush() {
        if (this.state === 'walking' && this.hp > 0) {
            this.state = 'crushed';
            this.crushTimer = this.crushDuration;
            this.hp = 0;
        }
    }

    /**
     * Deal damage to the enemy
     * @param {number} damage - Amount of damage to deal
     */
    takeDamage(damage) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.state = 'dead';
            this.hp = 0;
        }
    }

    /**
     * Check if enemy is alive
     * @returns {boolean} True if enemy has HP > 0
     */
    isAlive() {
        return this.hp > 0;
    }

    /**
     * Check if enemy is visible (not dead or despawned)
     * @returns {boolean} True if enemy should be rendered
     */
    isVisible() {
        return this.state !== 'dead';
    }

    /**
     * Determine collision direction between this enemy and another AABB
     * Used to distinguish between jumping on enemy vs hitting from side
     * @param {number} x - Other object's x position
     * @param {number} y - Other object's y position
     * @param {number} width - Other object's width
     * @param {number} height - Other object's height
     * @returns {string} Direction of collision: 'top', 'bottom', 'left', 'right', or null
     */
    getCollisionDirection(x, y, width, height) {
        if (!this.isCollidingWith(x, y, width, height)) {
            return null;
        }

        // Calculate overlap on each side
        const overlapLeft = (x + width) - this.x;
        const overlapRight = (this.x + this.width) - x;
        const overlapTop = (y + height) - this.y;
        const overlapBottom = (this.y + this.height) - y;

        // Find minimum overlap (the direction of collision)
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

        if (minOverlap === overlapTop) return 'top';    // Hitting from above (player jumping on enemy)
        if (minOverlap === overlapBottom) return 'bottom'; // Hitting from below
        if (minOverlap === overlapLeft) return 'left';   // Hitting from left
        if (minOverlap === overlapRight) return 'right';  // Hitting from right

        return null;
    }

    /**
     * Render enemy to canvas context
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    render(ctx) {
        if (!this.isVisible()) {
            return;
        }

        if (this.state === 'walking') {
            // Draw walking enemy (simple rect with eyes)
            ctx.fillStyle = '#8B0000'; // Dark red
            ctx.fillRect(this.x, this.y, this.width, this.height);

            // Draw eyes
            ctx.fillStyle = '#FFFFFF'; // White
            const eyeSize = 2;
            const eyeY = this.y + 4;
            ctx.fillRect(this.x + 4, eyeY, eyeSize, eyeSize);
            ctx.fillRect(this.x + this.width - 6, eyeY, eyeSize, eyeSize);

            // Draw direction indicator (simple line)
            ctx.strokeStyle = '#FFD700'; // Gold
            ctx.lineWidth = 1;
            const mouthY = this.y + this.height - 2;
            ctx.beginPath();
            if (this.direction > 0) {
                ctx.moveTo(this.x + this.width - 2, mouthY);
                ctx.lineTo(this.x + this.width - 4, mouthY);
            } else {
                ctx.moveTo(this.x + 2, mouthY);
                ctx.lineTo(this.x + 4, mouthY);
            }
            ctx.stroke();
        } else if (this.state === 'crushed') {
            // Draw crushed enemy (flat rect)
            ctx.fillStyle = '#440000'; // Darker red
            ctx.fillRect(this.x, this.y + this.height - 4, this.width, 4);
            ctx.fillStyle = 'rgba(139, 0, 0, 0.5)'; // Semi-transparent
            ctx.fillRect(this.x, this.y, this.width, this.height - 4);
        }
    }
}

// Export for Node.js/Jest
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Enemy };
}