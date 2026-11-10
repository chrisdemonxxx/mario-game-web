/**
 * Enemy class - handles enemy behavior, patrol AI, and collision detection
 */
class Enemy {
    constructor(x, y, type, patrolDistance, direction, mapWidth, mapHeight) {
        this.x = x;
        this.y = y;
        this.type = type; // 'goomba', 'koopa', etc.
        this.width = 24;
        this.height = 20;
        this.patrolDistance = patrolDistance;
        this.direction = direction || 1; // 1 for right, -1 for left
        this.speed = 2;
        this.startX = x;
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.alive = true;
        this.animationFrame = 0;
        this.crushed = false;
    }
    
    update(tilemap, tileSize) {
        if (!this.alive) return;
        
        // Patrol movement
        this.x += this.direction * this.speed;
        
        // Turn around at patrol distance or boundaries
        if (Math.abs(this.x - this.startX) > this.patrolDistance) {
            this.direction *= -1;
        }
        
        if (this.x < 0 || this.x + this.width > this.mapWidth) {
            this.direction *= -1;
        }
        
        // Apply basic gravity
        this.y += 2;
        
        // Simple collision detection to keep enemy on ground
        const groundFound = this.checkGround(tilemap, tileSize);
        if (!groundFound && this.y + this.height < this.mapHeight - 100) {
            // Fall through level (shouldn't happen if tilemap is setup correctly)
            this.alive = false;
        }
        
        // Update animation
        this.animationFrame = (this.animationFrame + 1) % 30;
    }
    
    checkGround(tilemap, tileSize) {
        const checkY = this.y + this.height + 2;
        const startCol = Math.floor(this.x / tileSize);
        const endCol = Math.floor((this.x + this.width) / tileSize);
        const checkRow = Math.floor(checkY / tileSize);
        
        for (let col = startCol; col <= endCol; col++) {
            if (checkRow >= 0 && checkRow < tilemap.length && col >= 0 && col < tilemap[0].length) {
                if (tilemap[checkRow][col] === 1) {
                    this.y = checkRow * tileSize - this.height;
                    return true;
                }
            }
        }
        
        return false;
    }
    
    collidesWith(obj) {
        return this.x < obj.x + obj.width &&
               this.x + this.width > obj.x &&
               this.y < obj.y + obj.height &&
               this.y + this.height > obj.y;
    }
    
    render(ctx) {
        if (!this.alive) return;
        
        // Draw enemy as a rectangle (placeholder before sprite graphics)
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw eyes facing direction
        ctx.fillStyle = '#FFF';
        const eyeX = this.direction > 0 ? this.x + 12 : this.x + 6;
        ctx.fillRect(eyeX, this.y + 6, 3, 3);
        ctx.fillRect(eyeX + 5, this.y + 6, 3, 3);
        
        // Draw pupils
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(eyeX + 1.5, this.y + 7.5, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eyeX + 6.5, this.y + 7.5, 1, 0, Math.PI * 2);
        ctx.fill();
    }
}
