/**
 * Tests for Sprite Graphics System
 */
const { SpriteManager } = require('../src/spriteManager');
const { SpriteAssets } = require('../src/spriteAssets');

describe('SpriteManager', () => {
    let spriteManager;

    beforeEach(() => {
        spriteManager = new SpriteManager();
    });

    describe('sprite management', () => {
        test('should get sprite by name', () => {
            const mockImage = new Image();
            spriteManager.sprites.set('test', mockImage);
            const sprite = spriteManager.getSprite('test');
            expect(sprite).toBe(mockImage);
        });

        test('should return null for non-existent sprite', () => {
            const sprite = spriteManager.getSprite('non-existent');
            expect(sprite).toBeNull();
        });
    });

    describe('animation management', () => {
        test('should register an animation', () => {
            spriteManager.registerAnimation('walk', 'player', 4, 100);
            const animation = spriteManager.animations.get('walk');

            expect(animation).toBeTruthy();
            expect(animation.frameCount).toBe(4);
            expect(animation.frameDuration).toBe(100);
            expect(animation.totalDuration).toBe(400);
        });

        test('should calculate current animation frame', () => {
            spriteManager.registerAnimation('walk', 'player', 4, 100);

            expect(spriteManager.getAnimationFrame('walk', 0)).toBe(0);
            expect(spriteManager.getAnimationFrame('walk', 150)).toBe(1);
            expect(spriteManager.getAnimationFrame('walk', 300)).toBe(3);
            expect(spriteManager.getAnimationFrame('walk', 400)).toBe(0);
            expect(spriteManager.getAnimationFrame('walk', 500)).toBe(1);
        });

        test('should return 0 for non-existent animation', () => {
            const frame = spriteManager.getAnimationFrame('non-existent', 100);
            expect(frame).toBe(0);
        });
    });

    describe('SpriteAssets', () => {
        test('should have player sprites', () => {
            expect(SpriteAssets.player).toBeTruthy();
            expect(SpriteAssets.player.idle).toBeTruthy();
            expect(SpriteAssets.player.run_frame_0).toBeTruthy();
            expect(SpriteAssets.player.jump).toBeTruthy();
            expect(SpriteAssets.player.fall).toBeTruthy();
        });

        test('should have enemy sprites', () => {
            expect(SpriteAssets.enemy).toBeTruthy();
            expect(SpriteAssets.enemy.walk_frame_0).toBeTruthy();
            expect(SpriteAssets.enemy.crushed).toBeTruthy();
        });

        test('should have coin sprites with animation frames', () => {
            expect(SpriteAssets.coin).toBeTruthy();
            expect(SpriteAssets.coin.spin_frame_0).toBeTruthy();
            expect(SpriteAssets.coin.spin_frame_1).toBeTruthy();
            expect(SpriteAssets.coin.spin_frame_2).toBeTruthy();
        });

        test('should have tile sprites', () => {
            expect(SpriteAssets.tiles).toBeTruthy();
            expect(SpriteAssets.tiles.grass).toBeTruthy();
            expect(SpriteAssets.tiles.stone).toBeTruthy();
            expect(SpriteAssets.tiles.spike).toBeTruthy();
        });

        test('should have goal sprite', () => {
            expect(SpriteAssets.goal).toBeTruthy();
            expect(SpriteAssets.goal.flag).toBeTruthy();
        });

        test('should have UI sprites', () => {
            expect(SpriteAssets.ui).toBeTruthy();
            expect(SpriteAssets.ui.heart).toBeTruthy();
        });

        test('should provide color palette', () => {
            const colors = SpriteAssets.getColorPalette();
            expect(colors).toBeInstanceOf(Array);
            expect(colors.length).toBeGreaterThan(0);
            colors.forEach(color => {
                expect(color).toMatch(/^#[0-9A-F]{6}$/i);
            });
        });

        test('should return all sprites', () => {
            const all = SpriteAssets.getAll();
            expect(all.player).toBeTruthy();
            expect(all.enemy).toBeTruthy();
            expect(all.coin).toBeTruthy();
            expect(all.tiles).toBeTruthy();
            expect(all.goal).toBeTruthy();
            expect(all.ui).toBeTruthy();
        });

        test('all sprite patterns should be 2D arrays', () => {
            const allSprites = SpriteAssets.getAll();

            Object.values(allSprites).forEach(category => {
                Object.values(category).forEach(pattern => {
                    expect(Array.isArray(pattern)).toBe(true);
                    pattern.forEach(row => {
                        expect(Array.isArray(row)).toBe(true);
                    });
                });
            });
        });

        test('sprite patterns should only contain valid color indices', () => {
            const colors = SpriteAssets.getColorPalette();
            const allSprites = SpriteAssets.getAll();
            const maxColorIndex = colors.length;

            Object.values(allSprites).forEach(category => {
                Object.values(category).forEach(pattern => {
                    pattern.forEach(row => {
                        row.forEach(colorIndex => {
                            expect(colorIndex).toBeGreaterThanOrEqual(0);
                            expect(colorIndex).toBeLessThanOrEqual(maxColorIndex);
                        });
                    });
                });
            });
        });
    });

    describe('sprite manager clear', () => {
        test('should clear all sprites and animations', () => {
            spriteManager.registerAnimation('test', 'sprite', 4, 100);
            const mockImage = new Image();
            spriteManager.sprites.set('test-sprite', mockImage);

            expect(spriteManager.sprites.size).toBeGreaterThan(0);
            expect(spriteManager.animations.size).toBeGreaterThan(0);

            spriteManager.clear();

            expect(spriteManager.sprites.size).toBe(0);
            expect(spriteManager.animations.size).toBe(0);
        });
    });
});
