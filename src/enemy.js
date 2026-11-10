/* global module */
/**
 * Enemy class - handles enemy behavior, patrol AI, and collision detection
 */
// eslint-disable-next-line no-unused-vars
class Enemy {
    constructor(x, y, type, patrolDistance, direction, mapWidth, mapHeight) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 24;
        this.height = 20;
        this.patrolDistance = patrolDistance;
        this.patrolStart = x;
        this.patrolEnd = x + patrolDistance;
        this.direction = direction;
        this.speed = 2;
        this.velocityY = 0;
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.health = 1;
        this.active = true;
    }
    
    update(tilemap, tileSize) {
        if (!this.active) return;
        this.velocityY += 0.6;
        this.velocityY = Math.min(this.velocityY, 15);
        this.y += this.velocityY;
        this.x += this.direction * this.speed;
        if (this.x <= this.patrolStart || this.x + this.width >= this.patrolEnd) {
            this.direction *= -1;
        }
    }
    
    collidesWith(obj) {
        return this.x < obj.x + obj.width && this.x + this.width > obj.x &&
               this.y < obj.y + obj.height && this.y + this.height > obj.y;
    }
    
    takeDamage() {
        this.health--;
        if (this.health <= 0) this.active = false;
    }
    
    render(ctx) {
        ctx.fillStyle = this.type === 'goomba' ? '#8B4513' : '#00AA00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = '#FFF';
        ctx.fillRect(this.x + 4, this.y + 4, 4, 4);
        ctx.fillRect(this.x + 16, this.y + 4, 4, 4);
    }
}

if (typeof module !== 'undefined' && module.exports) { module.exports = Enemy; }