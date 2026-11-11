/**
 * Physics Engine - Handles collision detection, gravity, and physics calculations
 */

class Physics {
    constructor() {
        // Physics constants
        this.GRAVITY = 600;           // pixels/second²
        this.MAX_FALL_SPEED = 500;    // pixels/second
        this.GROUND_FRICTION = 0;     // No friction on platforms
        this.AIR_RESISTANCE = 0;      // No air resistance
        this.TILE_SIZE = 32;          // Standard grid tile size

        // Collision tile types
        this.TILE_EMPTY = 0;
        this.TILE_SOLID = 1;
        this.TILE_SPIKE = 2;
        this.TILE_MOVING_PLATFORM = 3;
    }

    /**
     * AABB Collision Detection
     * Returns collision direction if objects overlap, null otherwise
     */
    getCollision(rect1, rect2) {
        // Quick check - no overlap at all
        if (rect1.right < rect2.left || rect1.left > rect2.right) {
            return null;
        }
        if (rect1.bottom < rect2.top || rect1.top > rect2.bottom) {
            return null;
        }

        // Calculate overlap on each side
        const overlapLeft = rect1.right - rect2.left;
        const overlapRight = rect2.right - rect1.left;
        const overlapTop = rect1.bottom - rect2.top;
        const overlapBottom = rect2.bottom - rect1.top;

        // Return direction of smallest overlap
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
        if (minOverlap === overlapTop) return 'TOP';
        if (minOverlap === overlapBottom) return 'BOTTOM';
        if (minOverlap === overlapLeft) return 'LEFT';
        return 'RIGHT';
    }

    /**
     * Get bounding box for an entity
     */
    getBounds(x, y, width, height) {
        return {
            left: x,
            right: x + width,
            top: y,
            bottom: y + height
        };
    }

    /**
     * Get tile at map position
     */
    getTileAt(tilemap, tileX, tileY) {
        if (!tilemap || !tilemap.data) {
            return this.TILE_EMPTY;
        }
        if (tileY < 0 || tileY >= tilemap.data.length) {
            return this.TILE_EMPTY;
        }
        if (tileX < 0 || tileX >= tilemap.data[tileY].length) {
            return this.TILE_EMPTY;
        }
        return tilemap.data[tileY][tileX];
    }

    /**
     * Get collision tiles in a rectangle area
     */
    getCollisionTilesInRect(tilemap, x, y, width, height) {
        const tiles = [];
        const startTileX = Math.floor(x / this.TILE_SIZE);
        const endTileX = Math.ceil((x + width) / this.TILE_SIZE);
        const startTileY = Math.floor(y / this.TILE_SIZE);
        const endTileY = Math.ceil((y + height) / this.TILE_SIZE);

        for (let tileY = startTileY; tileY < endTileY; tileY++) {
            for (let tileX = startTileX; tileX < endTileX; tileX++) {
                const tileType = this.getTileAt(tilemap, tileX, tileY);
                if (tileType !== this.TILE_EMPTY) {
                    tiles.push({
                        x: tileX,
                        y: tileY,
                        type: tileType,
                        bounds: this.getBounds(
                            tileX * this.TILE_SIZE,
                            tileY * this.TILE_SIZE,
                            this.TILE_SIZE,
                            this.TILE_SIZE
                        )
                    });
                }
            }
        }
        return tiles;
    }

    /**
     * Apply gravity to an entity's velocity
     */
    applyGravity(velocityY, deltaTime) {
        const deltaSeconds = deltaTime / 1000; // Convert to seconds
        const newVelocityY = velocityY + (this.GRAVITY * deltaSeconds);
        return Math.min(newVelocityY, this.MAX_FALL_SPEED);
    }

    /**
     * Check if player is on ground (platform below)
     */
    isOnGround(playerBounds, tilemap) {
        // Check slightly below player for ground
        const checkY = playerBounds.bottom + 2;
        const checkBounds = this.getBounds(
            playerBounds.left,
            checkY,
            playerBounds.right - playerBounds.left,
            2
        );

        const tiles = this.getCollisionTilesInRect(
            tilemap,
            checkBounds.left,
            checkBounds.top,
            checkBounds.right - checkBounds.left,
            checkBounds.bottom - checkBounds.top
        );

        return tiles.some(tile => tile.type === this.TILE_SOLID);
    }

    /**
     * Resolve horizontal collision
     */
    resolveHorizontalCollision(playerBounds, playerVelocityX, tilemap) {
        const checkBounds = this.getBounds(
            playerBounds.left + playerVelocityX * 0.1,
            playerBounds.top,
            playerBounds.right - playerBounds.left,
            playerBounds.bottom - playerBounds.top
        );

        const tiles = this.getCollisionTilesInRect(
            tilemap,
            checkBounds.left,
            checkBounds.top,
            checkBounds.right - checkBounds.left,
            checkBounds.bottom - checkBounds.top
        );

        for (const tile of tiles) {
            if (tile.type === this.TILE_SOLID) {
                // Return the resolved velocity (stop movement)
                return 0;
            }
        }
        return playerVelocityX;
    }

    /**
     * Resolve vertical collision
     */
    resolveVerticalCollision(playerBounds, playerVelocityY, tilemap) {
        const checkBounds = this.getBounds(
            playerBounds.left,
            playerBounds.top + playerVelocityY * 0.1,
            playerBounds.right - playerBounds.left,
            playerBounds.bottom - playerBounds.top
        );

        const tiles = this.getCollisionTilesInRect(
            tilemap,
            checkBounds.left,
            checkBounds.top,
            checkBounds.right - checkBounds.left,
            checkBounds.bottom - checkBounds.top
        );

        for (const tile of tiles) {
            if (tile.type === this.TILE_SOLID) {
                // Stop vertical movement
                return 0;
            }
            if (tile.type === this.TILE_SPIKE) {
                return { collision: 'SPIKE', velocityY: 0 };
            }
        }
        return playerVelocityY;
    }

    /**
     * Check for entity collisions (e.g., player vs enemy, player vs coin)
     */
    checkEntityCollision(rect1, rect2) {
        return this.getCollision(rect1, rect2);
    }

    /**
     * Update physics for an entity (player)
     */
    updatePhysics(entity, tilemap, deltaTime) {
        if (!entity || !tilemap) {
            return;
        }

        const deltaSeconds = deltaTime / 1000;

        // Get current bounds
        const currentBounds = this.getBounds(entity.x, entity.y, entity.width, entity.height);

        // Apply gravity
        entity.velocityY = this.applyGravity(entity.velocityY, deltaTime);

        // Check for falling into pit
        if (entity.y > tilemap.height * this.TILE_SIZE) {
            entity.fellIntoPit = true;
            return;
        }

        // Resolve horizontal collisions
        entity.velocityX = this.resolveHorizontalCollision(
            currentBounds,
            entity.velocityX,
            tilemap
        );

        // Update horizontal position
        entity.x += entity.velocityX * deltaSeconds;

        // Get updated bounds after horizontal movement
        const horizontalBounds = this.getBounds(entity.x, entity.y, entity.width, entity.height);

        // Resolve vertical collisions
        const verticalResult = this.resolveVerticalCollision(
            horizontalBounds,
            entity.velocityY,
            tilemap
        );

        if (typeof verticalResult === 'object' && verticalResult.collision === 'SPIKE') {
            entity.touchedSpike = true;
            entity.velocityY = 0;
        } else {
            entity.velocityY = verticalResult;
        }

        // Update vertical position
        entity.y += entity.velocityY * deltaSeconds;

        // Update grounded state
        entity.isGrounded = this.isOnGround(this.getBounds(entity.x, entity.y, entity.width, entity.height), tilemap);

        // If on ground, can jump again
        if (entity.isGrounded) {
            entity.canJump = true;
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Physics };
}
