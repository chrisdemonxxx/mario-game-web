const { Enemy } = require('../src/enemy');

describe('Enemy Class', () => {
    let enemy;

    beforeEach(() => {
        enemy = new Enemy(50, 100, 32, 32, 2);
    });

    describe('Constructor', () => {
        it('should initialize with correct properties', () => {
            expect(enemy.x).toBe(50);
            expect(enemy.y).toBe(100);
            expect(enemy.width).toBe(32);
            expect(enemy.height).toBe(32);
            expect(enemy.speed).toBe(2);
        });

        it('should have default width and height if not provided', () => {
            const defaultEnemy = new Enemy(0, 0);
            expect(defaultEnemy.width).toBe(32);
            expect(defaultEnemy.height).toBe(32);
        });

        it('should have default speed if not provided', () => {
            const defaultEnemy = new Enemy(0, 0);
            expect(defaultEnemy.speed).toBe(2);
        });

        it('should initialize with direction 1 (right)', () => {
            expect(enemy.direction).toBe(1);
        });

        it('should initialize as active with full health', () => {
            expect(enemy.active).toBe(true);
            expect(enemy.health).toBe(1);
            expect(enemy.maxHealth).toBe(1);
        });
    });

    describe('Movement', () => {
        it('should move right when direction is 1', () => {
            const initialX = enemy.x;
            enemy.update(16);
            expect(enemy.x).toBe(initialX + 2);
        });

        it('should move left when direction is -1', () => {
            enemy.direction = -1;
            const initialX = enemy.x;
            enemy.update(16);
            expect(enemy.x).toBe(initialX - 2);
        });

        it('should respect deltaTime for movement speed', () => {
            const initialX = enemy.x;
            enemy.update(32);
            expect(enemy.x).toBe(initialX + 4); // 2 * 2 (speed * deltaTime/16)
        });

        it('should not move when inactive', () => {
            enemy.active = false;
            const initialX = enemy.x;
            enemy.update(16);
            expect(enemy.x).toBe(initialX);
        });
    });

    describe('Direction Control', () => {
        it('should change direction from right to left', () => {
            expect(enemy.direction).toBe(1);
            enemy.changeDirection();
            expect(enemy.direction).toBe(-1);
        });

        it('should toggle direction correctly', () => {
            enemy.changeDirection();
            enemy.changeDirection();
            expect(enemy.direction).toBe(1);
        });
    });

    describe('Health and Damage', () => {
        it('should take damage and reduce health', () => {
            expect(enemy.health).toBe(1);
            enemy.takeDamage(1);
            expect(enemy.health).toBe(0);
        });

        it('should become inactive when health reaches 0', () => {
            expect(enemy.active).toBe(true);
            enemy.takeDamage(1);
            expect(enemy.active).toBe(false);
        });

        it('should become inactive when health goes below 0', () => {
            enemy.takeDamage(2);
            expect(enemy.active).toBe(false);
            expect(enemy.health).toBe(-1);
        });
    });

    describe('Collision Detection', () => {
        it('should detect collision with overlapping object', () => {
            const other = { x: 60, y: 110, width: 32, height: 32 };
            expect(enemy.isCollidingWith(other)).toBe(true);
        });

        it('should not detect collision with non-overlapping object', () => {
            const other = { x: 100, y: 100, width: 32, height: 32 };
            expect(enemy.isCollidingWith(other)).toBe(false);
        });

        it('should detect collision on right edge', () => {
            const other = { x: 80, y: 100, width: 32, height: 32 };
            expect(enemy.isCollidingWith(other)).toBe(true);
        });

        it('should detect collision on left edge', () => {
            const other = { x: 20, y: 100, width: 32, height: 32 };
            expect(enemy.isCollidingWith(other)).toBe(true);
        });

        it('should not detect collision with just touching edges', () => {
            const other = { x: 82, y: 100, width: 32, height: 32 };
            expect(enemy.isCollidingWith(other)).toBe(false);
        });

        it('should be commutative (A collides with B = B collides with A)', () => {
            const other = { x: 60, y: 110, width: 32, height: 32 };
            const collision1 = enemy.isCollidingWith(other);
            const collision2 = other.x < enemy.x + enemy.width &&
                         other.x + other.width > enemy.x &&
                         other.y < enemy.y + enemy.height &&
                         other.y + other.height > enemy.y;
            expect(collision1).toBe(collision2);
        });
    });

    describe('Boundary Detection', () => {
        it('should detect boundary and change direction when hitting right boundary', () => {
            enemy.x = 250;
            enemy.direction = 1;
            const result = enemy.detectBoundary(0, 250);
            expect(result).toBe(true);
            expect(enemy.direction).toBe(-1);
        });

        it('should detect boundary and change direction when hitting left boundary', () => {
            enemy.x = 0;
            enemy.direction = -1;
            const result = enemy.detectBoundary(0, 300);
            expect(result).toBe(true);
            expect(enemy.direction).toBe(1);
        });

        it('should not detect boundary when within bounds', () => {
            enemy.x = 100;
            const result = enemy.detectBoundary(0, 300);
            expect(result).toBe(false);
            expect(enemy.direction).toBe(1);
        });

        it('should handle custom boundary values', () => {
            enemy.x = 50;
            const result = enemy.detectBoundary(100, 200);
            expect(result).toBe(true);
        });
    });

    describe('Integration Tests', () => {
        it('should patrol and handle boundary', () => {
            const initialX = enemy.x;
            enemy.update(16);
            expect(enemy.x).toBe(initialX + 2);
            
            enemy.detectBoundary(0, 60);
            enemy.update(16);
            expect(enemy.x).toBe(initialX + 2 - 2); // moves back after direction change
        });

        it('should handle damage and stop moving', () => {
            enemy.takeDamage(1);
            const x = enemy.x;
            enemy.update(16);
            expect(enemy.x).toBe(x); // no movement when inactive
        });
    });
});
