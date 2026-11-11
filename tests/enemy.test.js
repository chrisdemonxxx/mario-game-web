/**
 * Tests for Enemy class and collision detection
 */

const { Enemy } = require('../src/enemy');

describe('Enemy', () => {
    describe('initialization', () => {
        it('should create an enemy with default properties', () => {
            const enemy = new Enemy(100, 200);
            expect(enemy.x).toBe(100);
            expect(enemy.y).toBe(200);
            expect(enemy.width).toBe(16);
            expect(enemy.height).toBe(16);
            expect(enemy.speed).toBe(80);
            expect(enemy.direction).toBe(1);
            expect(enemy.state).toBe('walking');
            expect(enemy.hp).toBe(1);
        });

        it('should accept custom options', () => {
            const options = {
                width: 32,
                height: 32,
                speed: 120,
                patrolDistance: 300
            };
            const enemy = new Enemy(50, 100, options);
            expect(enemy.width).toBe(32);
            expect(enemy.height).toBe(32);
            expect(enemy.speed).toBe(120);
            expect(enemy.patrolDistance).toBe(300);
        });
    });

    describe('patrol movement', () => {
        it('should move right when direction is 1', () => {
            const enemy = new Enemy(100, 100);
            enemy.direction = 1;
            enemy.update(1); // 1 second
            expect(enemy.x).toBe(100 + 80); // speed = 80
        });

        it('should move left when direction is -1', () => {
            const enemy = new Enemy(100, 100);
            enemy.direction = -1;
            enemy.update(1);
            expect(enemy.x).toBe(100 - 80);
        });

        it('should reverse direction at patrol boundary', () => {
            const enemy = new Enemy(100, 100, { patrolDistance: 100, speed: 50 });
            enemy.direction = 1;
            
            // Move right towards boundary
            enemy.update(2.5); // 2.5 seconds * 50 px/s = 125 px (exceeds 100 px boundary)
            
            // Should have reversed direction
            expect(enemy.direction).toBe(-1);
            expect(Math.abs(enemy.x - enemy.patrolStart)).toBeLessThanOrEqual(100);
        });

        it('should patrol symmetrically from start position', () => {
            const enemy = new Enemy(200, 100, { patrolDistance: 50, speed: 25 });
            
            // Move right
            enemy.direction = 1;
            enemy.update(2.5); // 2.5 * 25 = 62.5 px
            const rightmost = enemy.x;
            expect(rightmost).toBeLessThanOrEqual(200 + 50);
            
            // Should be moving left now
            expect(enemy.direction).toBe(-1);
        });
    });

    describe('collision detection', () => {
        it('should detect AABB overlap', () => {
            const enemy = new Enemy(100, 100, { width: 20, height: 20 });
            expect(enemy.isCollidingWith(110, 110, 20, 20)).toBe(true);
        });

        it('should not detect collision when separated', () => {
            const enemy = new Enemy(100, 100, { width: 20, height: 20 });
            expect(enemy.isCollidingWith(150, 150, 20, 20)).toBe(false);
        });

        it('should handle edge-touching (no overlap)', () => {
            const enemy = new Enemy(100, 100, { width: 20, height: 20 });
            expect(enemy.isCollidingWith(120, 100, 20, 20)).toBe(false);
        });

        it('should return bounds correctly', () => {
            const enemy = new Enemy(50, 75, { width: 32, height: 32 });
            const bounds = enemy.getBounds();
            expect(bounds.x).toBe(50);
            expect(bounds.y).toBe(75);
            expect(bounds.width).toBe(32);
            expect(bounds.height).toBe(32);
        });
    });

    describe('collision direction', () => {
        it('should detect top collision (player jumping on enemy)', () => {
            const enemy = new Enemy(100, 100, { width: 20, height: 20 });
            const direction = enemy.getCollisionDirection(105, 85, 10, 20);
            expect(direction).toBe('top');
        });

        it('should detect bottom collision', () => {
            const enemy = new Enemy(100, 100, { width: 20, height: 20 });
            const direction = enemy.getCollisionDirection(105, 115, 10, 20);
            expect(direction).toBe('bottom');
        });

        it('should detect left collision', () => {
            const enemy = new Enemy(100, 100, { width: 20, height: 20 });
            const direction = enemy.getCollisionDirection(85, 105, 20, 10);
            expect(direction).toBe('left');
        });

        it('should detect right collision', () => {
            const enemy = new Enemy(100, 100, { width: 20, height: 20 });
            const direction = enemy.getCollisionDirection(115, 105, 20, 10);
            expect(direction).toBe('right');
        });

        it('should return null when no collision', () => {
            const enemy = new Enemy(100, 100, { width: 20, height: 20 });
            const direction = enemy.getCollisionDirection(200, 200, 20, 20);
            expect(direction).toBeNull();
        });
    });

    describe('damage and crush mechanics', () => {
        it('should crush when called', () => {
            const enemy = new Enemy(100, 100);
            enemy.crush();
            expect(enemy.state).toBe('crushed');
            expect(enemy.hp).toBe(0);
        });

        it('should take damage', () => {
            const enemy = new Enemy(100, 100);
            enemy.takeDamage(1);
            expect(enemy.hp).toBe(0);
            expect(enemy.state).toBe('dead');
        });

        it('should not crush if already dead', () => {
            const enemy = new Enemy(100, 100);
            enemy.state = 'dead';
            enemy.hp = 0;
            enemy.crush();
            expect(enemy.state).toBe('dead');
        });

        it('should report alive status correctly', () => {
            const enemy = new Enemy(100, 100);
            expect(enemy.isAlive()).toBe(true);
            enemy.takeDamage(1);
            expect(enemy.isAlive()).toBe(false);
        });

        it('should report visibility correctly', () => {
            const enemy = new Enemy(100, 100);
            expect(enemy.isVisible()).toBe(true);
            enemy.state = 'dead';
            expect(enemy.isVisible()).toBe(false);
        });

        it('should transition from crushed to dead after timer', () => {
            const enemy = new Enemy(100, 100);
            enemy.crushDuration = 0.5;
            enemy.crush();
            expect(enemy.state).toBe('crushed');
            
            enemy.update(0.3);
            expect(enemy.state).toBe('crushed');
            
            enemy.update(0.3);
            expect(enemy.state).toBe('dead');
        });
    });

    describe('rendering', () => {
        it('should not render when invisible', () => {
            const enemy = new Enemy(100, 100);
            enemy.state = 'dead';
            
            const ctx = {
                fillRect: jest.fn()
            };
            
            enemy.render(ctx);
            expect(ctx.fillRect).not.toHaveBeenCalled();
        });

        it('should render when walking', () => {
            const enemy = new Enemy(100, 100);
            const ctx = {
                fillRect: jest.fn(),
                fillStyle: '',
                strokeStyle: '',
                lineWidth: 0,
                beginPath: jest.fn(),
                moveTo: jest.fn(),
                lineTo: jest.fn(),
                stroke: jest.fn()
            };
            
            enemy.render(ctx);
            expect(ctx.fillRect).toHaveBeenCalled();
        });

        it('should render when crushed', () => {
            const enemy = new Enemy(100, 100);
            enemy.state = 'crushed';
            
            const ctx = {
                fillRect: jest.fn(),
                fillStyle: ''
            };
            
            enemy.render(ctx);
            expect(ctx.fillRect).toHaveBeenCalled();
        });
    });

    describe('integration scenarios', () => {
        it('should handle full enemy lifecycle: patrol, get jumped on, crush, despawn', () => {
            const enemy = new Enemy(100, 100, { speed: 50, patrolDistance: 100 });
            enemy.crushDuration = 0.5;
            
            // Enemy patrols right
            expect(enemy.state).toBe('walking');
            enemy.update(0.5);
            expect(enemy.x).toBeGreaterThan(100);
            
            // Player jumps on enemy at its current position
            const collisionDir = enemy.getCollisionDirection(enemy.x - 5, enemy.y - 15, 10, 20);
            expect(collisionDir).toBe('top');
            enemy.crush();
            expect(enemy.state).toBe('crushed');
            
            // Enemy crushed for a bit
            enemy.update(0.4);
            expect(enemy.state).toBe('crushed');
            
            // Crush timer expires, enemy dies
            enemy.update(0.2);
            expect(enemy.state).toBe('dead');
            expect(enemy.isVisible()).toBe(false);
        });

        it('should handle side collision differently from jump collision', () => {
            const enemy = new Enemy(100, 100, { width: 20, height: 20 });
            
            // Player hits from side
            const sideCollision = enemy.getCollisionDirection(110, 105, 20, 10);
            expect(['left', 'right']).toContain(sideCollision);
            
            // Player jumps on top
            const topCollision = enemy.getCollisionDirection(105, 85, 10, 20);
            expect(topCollision).toBe('top');
        });

        it('should stop patrolling when crushed', () => {
            const enemy = new Enemy(100, 100, { speed: 100, patrolDistance: 200 });
            const posBeforeCrush = enemy.x;
            
            enemy.crush();
            enemy.update(1);
            
            // Position shouldn't change significantly while crushed
            expect(Math.abs(enemy.x - posBeforeCrush)).toBeLessThan(5);
        });
    });
});
