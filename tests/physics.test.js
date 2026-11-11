const Physics = require('../src/physics');

describe('Physics', () => {
    describe('checkAABB', () => {
        it('should detect overlapping rectangles', () => {
            const rect1 = { x: 0, y: 0, width: 50, height: 50 };
            const rect2 = { x: 25, y: 25, width: 50, height: 50 };
            expect(Physics.checkAABB(rect1, rect2)).toBe(true);
        });

        it('should detect non-overlapping rectangles', () => {
            const rect1 = { x: 0, y: 0, width: 50, height: 50 };
            const rect2 = { x: 100, y: 100, width: 50, height: 50 };
            expect(Physics.checkAABB(rect1, rect2)).toBe(false);
        });

        it('should detect rectangles touching at edges', () => {
            const rect1 = { x: 0, y: 0, width: 50, height: 50 };
            const rect2 = { x: 50, y: 0, width: 50, height: 50 };
            expect(Physics.checkAABB(rect1, rect2)).toBe(false);
        });

        it('should detect one rectangle inside another', () => {
            const outer = { x: 0, y: 0, width: 100, height: 100 };
            const inner = { x: 25, y: 25, width: 50, height: 50 };
            expect(Physics.checkAABB(outer, inner)).toBe(true);
        });

        it('should handle rectangles at different positions', () => {
            const rect1 = { x: 10, y: 10, width: 30, height: 30 };
            const rect2 = { x: 20, y: 20, width: 30, height: 30 };
            expect(Physics.checkAABB(rect1, rect2)).toBe(true);
        });

        it('should be commutative', () => {
            const rect1 = { x: 0, y: 0, width: 50, height: 50 };
            const rect2 = { x: 25, y: 25, width: 50, height: 50 };
            expect(Physics.checkAABB(rect1, rect2)).toBe(Physics.checkAABB(rect2, rect1));
        });

        it('should work with zero dimensions', () => {
            const rect1 = { x: 0, y: 0, width: 0, height: 0 };
            const rect2 = { x: 0, y: 0, width: 50, height: 50 };
            expect(Physics.checkAABB(rect1, rect2)).toBe(false);
        });
    });

    describe('applyGravity', () => {
        it('should increase vertical velocity', () => {
            const obj = { vy: 0 };
            Physics.applyGravity(obj);
            expect(obj.vy).toBe(0.8);
        });

        it('should accumulate gravity over multiple frames', () => {
            const obj = { vy: 0 };
            Physics.applyGravity(obj);
            Physics.applyGravity(obj);
            Physics.applyGravity(obj);
            expect(obj.vy).toBeCloseTo(2.4, 5);
        });

        it('should approach terminal velocity progressively', () => {
            const obj = { vy: 0 };
            for (let i = 0; i < 18; i++) {
                Physics.applyGravity(obj);
            }
            expect(obj.vy).toBeLessThan(15);
            expect(obj.vy).toBeGreaterThan(14);
        });

        it('should stop increasing at terminal velocity', () => {
            const obj = { vy: 15 };
            const before = obj.vy;
            Physics.applyGravity(obj);
            expect(obj.vy).toBe(before);
        });

        it('should work with negative velocities', () => {
            const obj = { vy: -5 };
            Physics.applyGravity(obj);
            expect(obj.vy).toBe(-4.2);
        });

        it('should apply gravity acceleration constant', () => {
            const obj = { vy: 5 };
            Physics.applyGravity(obj);
            expect(obj.vy).toBe(5.8);
        });
    });
});
