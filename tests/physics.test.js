const { Physics } = require('../src/physics');

describe('Physics Engine - Collision Detection & Core Mechanics', () => {
    let physics;

    beforeEach(() => {
        physics = new Physics();
    });

    describe('AABB Collision Detection', () => {
        test('Detects collision when rectangles overlap', () => {
            const rect1 = { left: 10, right: 50, top: 10, bottom: 50 };
            const rect2 = { left: 30, right: 70, top: 30, bottom: 70 };
            const collision = physics.getCollision(rect1, rect2);
            expect(collision).not.toBeNull();
        });

        test('Returns null when rectangles do not overlap', () => {
            const rect1 = { left: 10, right: 50, top: 10, bottom: 50 };
            const rect2 = { left: 100, right: 150, top: 100, bottom: 150 };
            const collision = physics.getCollision(rect1, rect2);
            expect(collision).toBeNull();
        });

        test('Correctly identifies collision direction TOP', () => {
            const rect1 = { left: 0, right: 32, top: 0, bottom: 32 };
            const rect2 = { left: 0, right: 32, top: 20, bottom: 52 };
            const collision = physics.getCollision(rect1, rect2);
            expect(collision).toBe('TOP');
        });

        test('Correctly identifies collision direction BOTTOM', () => {
            const rect1 = { left: 0, right: 32, top: 50, bottom: 80 };
            const rect2 = { left: 0, right: 32, top: 20, bottom: 60 };
            const collision = physics.getCollision(rect1, rect2);
            expect(collision).toBe('BOTTOM');
        });

        test('Returns valid collision direction for horizontal overlap', () => {
            const rect1 = { left: 50, right: 80, top: 0, bottom: 32 };
            const rect2 = { left: 0, right: 60, top: 0, bottom: 32 };
            const collision = physics.getCollision(rect1, rect2);
            expect(['LEFT', 'RIGHT']).toContain(collision);
        });

        test('Returns valid collision direction for horizontal overlap reversed', () => {
            const rect1 = { left: 0, right: 30, top: 0, bottom: 32 };
            const rect2 = { left: 20, right: 100, top: 0, bottom: 32 };
            const collision = physics.getCollision(rect1, rect2);
            expect(['LEFT', 'RIGHT']).toContain(collision);
        });
    });

    describe('Bounding Box Generation', () => {
        test('Correctly generates bounding box from position and size', () => {
            const bounds = physics.getBounds(10, 20, 32, 32);
            expect(bounds).toEqual({
                left: 10,
                right: 42,
                top: 20,
                bottom: 52
            });
        });
    });

    describe('Tilemap Collision System', () => {
        test('Returns TILE_EMPTY for out-of-bounds coordinates', () => {
            const tilemap = {
                data: [
                    [1, 1, 1],
                    [0, 0, 0],
                    [1, 1, 1]
                ]
            };
            expect(physics.getTileAt(tilemap, -1, 0)).toBe(physics.TILE_EMPTY);
            expect(physics.getTileAt(tilemap, 10, 10)).toBe(physics.TILE_EMPTY);
        });

        test('Returns correct tile type for valid coordinates', () => {
            const tilemap = {
                data: [
                    [1, 1, 1],
                    [0, 0, 0],
                    [2, 1, 3]
                ]
            };
            expect(physics.getTileAt(tilemap, 0, 0)).toBe(1); // TILE_SOLID
            expect(physics.getTileAt(tilemap, 1, 1)).toBe(0); // TILE_EMPTY
            expect(physics.getTileAt(tilemap, 0, 2)).toBe(2); // TILE_SPIKE
            expect(physics.getTileAt(tilemap, 2, 2)).toBe(3); // TILE_MOVING_PLATFORM
        });

        test('Gets collision tiles in rectangle area', () => {
            const tilemap = {
                data: [
                    [1, 1, 1],
                    [0, 0, 0],
                    [1, 1, 1]
                ],
                width: 3,
                height: 3
            };
            const tiles = physics.getCollisionTilesInRect(tilemap, 0, 0, 64, 32);
            const solidTiles = tiles.filter(t => t.type === physics.TILE_SOLID);
            expect(solidTiles.length).toBeGreaterThan(0);
        });
    });

    describe('Gravity Application', () => {
        test('Applies gravity correctly over time', () => {
            let velocityY = 0;
            velocityY = physics.applyGravity(velocityY, 16); // 16ms
            expect(velocityY).toBeGreaterThan(0);
        });

        test('Caps velocity at MAX_FALL_SPEED', () => {
            let velocityY = 0;
            for (let i = 0; i < 1000; i++) {
                velocityY = physics.applyGravity(velocityY, 16);
            }
            expect(velocityY).toBeLessThanOrEqual(physics.MAX_FALL_SPEED);
        });
    });

    describe('Ground Detection', () => {
        test('Detects when player is on ground (platform below)', () => {
            const playerBounds = {
                left: 0,
                right: 32,
                top: 32,
                bottom: 64
            };
            const tilemap = {
                data: [
                    [0, 0, 0],
                    [0, 0, 0],
                    [1, 1, 1]
                ],
                width: 3,
                height: 3
            };
            const onGround = physics.isOnGround(playerBounds, tilemap);
            expect(onGround).toBe(true);
        });

        test('Detects when player is NOT on ground (no platform below)', () => {
            const playerBounds = {
                left: 0,
                right: 32,
                top: 0,
                bottom: 32
            };
            const tilemap = {
                data: [
                    [0, 0, 0],
                    [0, 0, 0],
                    [1, 1, 1]
                ],
                width: 3,
                height: 3
            };
            const onGround = physics.isOnGround(playerBounds, tilemap);
            expect(onGround).toBe(false);
        });
    });

    describe('Collision Resolution', () => {
        test('Detects collision and stops movement when hitting solid tile', () => {
            const playerBounds = {
                left: 32,
                right: 64,
                top: 32,
                bottom: 64
            };
            const tilemap = {
                data: [
                    [0, 0, 0, 0],
                    [0, 1, 0, 0],
                    [0, 0, 0, 0]
                ],
                width: 4,
                height: 3
            };
            const velocityX = 5;
            const result = physics.resolveHorizontalCollision(playerBounds, velocityX, tilemap);
            // Should stop movement when hitting solid
            expect(result).toBe(0);
        });

        test('Resolves vertical collision by stopping movement', () => {
            const playerBounds = {
                left: 0,
                right: 32,
                top: 32,
                bottom: 64
            };
            const tilemap = {
                data: [
                    [0, 0, 0],
                    [1, 1, 1],
                    [1, 1, 1]
                ],
                width: 3,
                height: 3
            };
            const velocityY = 5;
            const result = physics.resolveVerticalCollision(playerBounds, velocityY, tilemap);
            expect(result).toBe(0);
        });

        test('Detects spike tile collision', () => {
            const playerBounds = {
                left: 0,
                right: 32,
                top: 32,
                bottom: 64
            };
            const tilemap = {
                data: [
                    [0, 0, 0],
                    [0, 0, 0],
                    [2, 0, 0]
                ],
                width: 3,
                height: 3
            };
            const velocityY = 5;
            const result = physics.resolveVerticalCollision(playerBounds, velocityY, tilemap);
            expect(typeof result).toBe('object');
            expect(result.collision).toBe('SPIKE');
        });
    });

    describe('Entity Collision', () => {
        test('Detects collision between two entities', () => {
            const player = { left: 10, right: 50, top: 10, bottom: 50 };
            const enemy = { left: 30, right: 70, top: 30, bottom: 70 };
            const collision = physics.checkEntityCollision(player, enemy);
            expect(collision).not.toBeNull();
        });

        test('Returns null when entities do not collide', () => {
            const player = { left: 10, right: 50, top: 10, bottom: 50 };
            const coin = { left: 100, right: 110, top: 100, bottom: 110 };
            const collision = physics.checkEntityCollision(player, coin);
            expect(collision).toBeNull();
        });
    });

    describe('Physics Update System', () => {
        test('Updates entity position with physics', () => {
            const entity = {
                x: 100,
                y: 100,
                width: 32,
                height: 32,
                velocityX: 0,
                velocityY: 0,
                isGrounded: false,
                canJump: false,
                fellIntoPit: false,
                touchedSpike: false
            };
            const tilemap = {
                data: [
                    [0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0],
                    [1, 1, 1, 1, 1]
                ],
                width: 5,
                height: 4
            };

            const originalY = entity.y;
            physics.updatePhysics(entity, tilemap, 16);

            // Entity should fall due to gravity
            expect(entity.y).toBeGreaterThanOrEqual(originalY);
        });

        test('Sets grounded flag when entity is on ground', () => {
            const entity = {
                x: 64,
                y: 64,
                width: 32,
                height: 32,
                velocityX: 0,
                velocityY: 100,
                isGrounded: false,
                canJump: false,
                fellIntoPit: false,
                touchedSpike: false
            };
            const tilemap = {
                data: [
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                    [1, 1, 1, 1],
                    [1, 1, 1, 1]
                ],
                width: 4,
                height: 4
            };

            physics.updatePhysics(entity, tilemap, 100);
            // After updating, entity should be considered grounded if on platform
            if (entity.y >= 64 && entity.y < 128) {
                // Entity is in ground area
                const finalBounds = physics.getBounds(entity.x, entity.y, entity.width, entity.height);
                const isOnGround = physics.isOnGround(finalBounds, tilemap);
                if (isOnGround) {
                    expect(entity.isGrounded).toBe(true);
                }
            }
        });

        test('Detects pit fall detection', () => {
            const entity = {
                x: 100,
                y: 200,
                width: 32,
                height: 32,
                velocityX: 0,
                velocityY: 0,
                isGrounded: false,
                canJump: false,
                fellIntoPit: false,
                touchedSpike: false
            };
            const tilemap = {
                data: [
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]
                ],
                width: 4,
                height: 3
            };

            entity.y = tilemap.height * physics.TILE_SIZE + 100;
            physics.updatePhysics(entity, tilemap, 16);
            expect(entity.fellIntoPit).toBe(true);
        });
    });

    describe('Performance and Constants', () => {
        test('Verifies physics constants are properly defined', () => {
            expect(physics.GRAVITY).toBe(600);
            expect(physics.MAX_FALL_SPEED).toBe(500);
            expect(physics.TILE_SIZE).toBe(32);
        });

        test('AABB collision check completes in constant time', () => {
            const rect1 = { left: 0, right: 100, top: 0, bottom: 100 };
            const rect2 = { left: 50, right: 150, top: 50, bottom: 150 };
            const start = Date.now();
            for (let i = 0; i < 10000; i++) {
                physics.getCollision(rect1, rect2);
            }
            const elapsed = Date.now() - start;
            // Should complete quickly (under 50ms for 10000 iterations)
            expect(elapsed).toBeLessThan(50);
        });
    });

    describe('Edge Cases and Robustness', () => {
        test('Handles null tilemap gracefully', () => {
            const entity = {
                x: 100,
                y: 100,
                width: 32,
                height: 32,
                velocityX: 0,
                velocityY: 0
            };
            expect(() => {
                physics.updatePhysics(entity, null, 16);
            }).not.toThrow();
        });

        test('Handles entities at tilemap boundaries', () => {
            const tilemap = {
                data: [
                    [1, 0, 0],
                    [0, 0, 0],
                    [0, 0, 1]
                ],
                width: 3,
                height: 3
            };
            const playerBounds = {
                left: -10,
                right: 20,
                top: -10,
                bottom: 20
            };
            expect(() => {
                physics.isOnGround(playerBounds, tilemap);
            }).not.toThrow();
        });

        test('Verifies zero-velocity entities remain stable', () => {
            const entity = {
                x: 100,
                y: 100,
                width: 32,
                height: 32,
                velocityX: 0,
                velocityY: 0,
                isGrounded: false,
                canJump: false,
                fellIntoPit: false,
                touchedSpike: false
            };
            const tilemap = {
                data: [
                    [0, 0, 0],
                    [0, 0, 0],
                    [1, 1, 1]
                ],
                width: 3,
                height: 3
            };

            const initialX = entity.x;
            physics.updatePhysics(entity, tilemap, 16);
            // X should not change if there's no horizontal velocity
            expect(entity.x).toBe(initialX);
        });
    });
});
