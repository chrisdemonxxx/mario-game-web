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

  describe('sprite generation and management', () => {
    test('should generate a pixel sprite', () => {
      const pattern = [
        [1, 1, 0],
        [0, 1, 1],
        [1, 1, 1],
      ];
      const colors = ['#FF0000', '#00FF00'];

      const dataUrl = spriteManager.generatePixelSprite('test', 30, 30, colors, pattern);

      expect(dataUrl).toBeTruthy();
      expect(dataUrl).toMatch(/^data:image\/png/);
    });

    test('should load a sprite', (done) => {
      const colors = ['#FF0000'];
      const pattern = [[1]];
      const dataUrl = spriteManager.generatePixelSprite('test', 8, 8, colors, pattern);

      spriteManager.loadSprite('test-sprite', dataUrl).then(() => {
        expect(spriteManager.getSprite('test-sprite')).toBeTruthy();
        done();
      }).catch(err => done(err));
    });

    test('should get sprite by name', () => {
      const colors = ['#FF0000'];
      const pattern = [[1]];

      spriteManager.sprites.set('test', new Image());
      const sprite = spriteManager.getSprite('test');
      expect(sprite).toBeTruthy();
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

      // At 0ms, should be frame 0
      expect(spriteManager.getAnimationFrame('walk', 0)).toBe(0);

      // At 150ms, should be frame 1
      expect(spriteManager.getAnimationFrame('walk', 150)).toBe(1);

      // At 300ms, should be frame 3
      expect(spriteManager.getAnimationFrame('walk', 300)).toBe(3);

      // After cycle completes, should loop back to frame 0
      expect(spriteManager.getAnimationFrame('walk', 400)).toBe(0);
      expect(spriteManager.getAnimationFrame('walk', 500)).toBe(1);
    });

    test('should return 0 for non-existent animation', () => {
      const frame = spriteManager.getAnimationFrame('non-existent', 100);
      expect(frame).toBe(0);
    });
  });

  describe('sprite rendering', () => {
    test('should render sprite to canvas', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');

      // Mock image
      const mockImg = new Image();
      spriteManager.sprites.set('test', mockImg);

      // Should not throw error
      expect(() => spriteManager.renderSprite(ctx, 'test', 10, 10, 32, 32)).not.toThrow();
    });

    test('should render animated sprite', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');

      spriteManager.registerAnimation('test-anim', 'test', 2, 50);
      spriteManager.sprites.set('test_frame_0', new Image());
      spriteManager.sprites.set('test_frame_1', new Image());

      expect(() => spriteManager.renderAnimation(ctx, 'test-anim', 0, 10, 10, 32, 32)).not.toThrow();
    });

    test('should not render if animation does not exist', () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      expect(() => spriteManager.renderAnimation(ctx, 'non-existent', 0, 10, 10, 32, 32)).not.toThrow();
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
      // All should be valid hex colors
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
      spriteManager.sprites.set('test-sprite', new Image());

      expect(spriteManager.sprites.size).toBeGreaterThan(0);
      expect(spriteManager.animations.size).toBeGreaterThan(0);

      spriteManager.clear();

      expect(spriteManager.sprites.size).toBe(0);
      expect(spriteManager.animations.size).toBe(0);
    });
  });
});
