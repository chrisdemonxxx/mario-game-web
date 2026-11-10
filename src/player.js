/**
 * Player class - handles player character movement, physics, and collision
 */
class Player {
    constructor(x, y, gravity, mapWidth, mapHeight) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 30;
        this.velocityX = 0;
        this.velocityY = 0;
        this.gravity = gravity;
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        
        // Physics
        this.friction = 0.9;
        this.acceleration = 1.5;
        this.maxSpeed = 5;
        this.jumpPower = -12;
        this.isJumping = false;
        this.onGround = false;
        
        // Health
        this.health = 3;
        this.maxHealth = 3;
        this.invulnerable = false;
        this.invulnerableTime = 0;
        
        // Animation
        this.animationFrame = 0;
    }
    
    update(keys, tilemap, tileSize) {
        // Handle input
        const moveLeft = keys['ArrowLeft'] || keys['a'] || keys['A'];
        const moveRight = keys['ArrowRight'] || keys['d'] || keys['D'];
        const jump = keys[' '];
        
        // Horizontal movement
        if (moveLeft) {
            this.velocityX -= this.acceleration;
        }
        if (moveRight) {
            this.velocityX += this.acceleration;
        }
        
        // Apply friction
        if (!moveLeft && !moveRight) {
            this.velocityX *= this.friction;
        }
        
        // Limit speed
        this.velocityX = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.velocityX));
        
        // Apply gravity
        this.velocityY += this.gravity;
        this.velocityY = Math.min(this.velocityY, 15); // Terminal velocity
        
        // Store old position for collision detection
        const oldX = this.x;
        const oldY = this.y;
        
        // Apply velocity
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Collision detection
        this.onGround = false;
        const collidingTiles = this.getTilesColliding(tilemap, tileSize);
        
        for (const tile of collidingTiles) {
            this.resolveCollision(tile, tilemap, tileSize);
        }
        
        // Check if on ground after collision
        this.onGround = this.checkOnGround(tilemap, tileSize);
        
        // Jump
        if (jump && this.onGround) {
            this.velocityY = this.jumpPower;
            this.isJumping = true;
            this.onGround = false;
        } else if (!jump) {
            this.isJumping = false;
        }
        
        // Boundary checking
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > this.mapWidth) this.x = this.mapWidth - this.width;
        
        // Update invulnerability
        if (this.invulnerable) {
            this.invulnerableTime--;
            if (this.invulnerableTime <= 0) {
                this.invulnerable = false;
            }
        }
        
        // Update animation
        this.animationFrame = (this.animationFrame + 1) % 60;
    }
    
    getTilesColliding(tilemap, tileSize) {
        const tiles = [];
        const startCol = Math.floor(this.x / tileSize);
        const endCol = Math.floor((this.x + this.width) / tileSize);
        const startRow = Math.floor(this.y / tileSize);
        const endRow = Math.floor((this.y + this.height) / tileSize);
        
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                if (row >= 0 && row < tilemap.length && col >= 0 && col < tilemap[0].length) {
                    if (tilemap[row][col] === 1) {
                        tiles.push({
                            x: col * tileSize,
                            y: row * tileSize,
                            width: tileSize,
                            height: tileSize
                        });
                    }
                }
            }
        }
        
        return tiles;
    }
    
    resolveCollision(tile, tilemap, tileSize) {
        // Calculate overlap
        const overlapLeft = (this.x + this.width) - tile.x;
        const overlapRight = (tile.x + tile.width) - this.x;
        const overlapTop = (this.y + this.height) - tile.y;
        const overlapBottom = (tile.y + tile.height) - this.y;
        
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
        
        // Resolve collision based on smallest overlap
        if (minOverlap === overlapTop && this.velocityY > 0) {
            // Collision from above (landing on tile)
            this.y = tile.y - this.height;
            this.velocityY = 0;
        } else if (minOverlap === overlapBottom && this.velocityY < 0) {
            // Collision from below (hitting head)
            this.y = tile.y + tile.height;
            this.velocityY = 0;
        } else if (minOverlap === overlapLeft && this.velocityX > 0) {
            // Collision from left
            this.x = tile.x - this.width;
            this.velocityX = 0;
        } else if (minOverlap === overlapRight && this.velocityX < 0) {
            // Collision from right
            this.x = tile.x + tile.width;
            this.velocityX = 0;
        }
    }
    
    checkOnGround(tilemap, tileSize) {
        const checkY = this.y + this.height + 2;
        const startCol = Math.floor(this.x / tileSize);
        const endCol = Math.floor((this.x + this.width) / tileSize);
        const checkRow = Math.floor(checkY / tileSize);
        
        for (let col = startCol; col <= endCol; col++) {
            if (checkRow >= 0 && checkRow < tilemap.length && col >= 0 && col < tilemap[0].length) {
                if (tilemap[checkRow][col] === 1) {
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
    
    takeDamage() {
        if (!this.invulnerable) {
            this.health--;
            this.invulnerable = true;
            this.invulnerableTime = 120; // 2 seconds at 60 FPS
        }
    }
    
    render(ctx) {
        // Flash when invulnerable
        if (this.invulnerable && Math.floor(this.invulnerableTime / 10) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        // Draw player as a rectangle (placeholder before sprite graphics)
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw eyes
        ctx.fillStyle = '#FFF';
        ctx.fillRect(this.x + 5, this.y + 10, 4, 4);
        ctx.fillRect(this.x + 11, this.y + 10, 4, 4);
        
        // Draw pupils
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 5 + (this.velocityX > 0 ? 2 : 0), this.y + 10, 2, 2);
        ctx.fillRect(this.x + 11 + (this.velocityX > 0 ? 2 : 0), this.y + 10, 2, 2);
        
        ctx.globalAlpha = 1.0;
    }
}
