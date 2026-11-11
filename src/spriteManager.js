/**
 * SpriteManager - Manages sprite loading, caching, and rendering
 * Handles animation frames and sprite sheet management
 */
class SpriteManager {
    constructor() {
        this.sprites = new Map();
        this.animations = new Map();
    }

    /**
   * Generate a simple pixel art sprite as a data URL
   * @param {string} name - Sprite name
   * @param {number} width - Sprite width in pixels
   * @param {number} height - Sprite height in pixels
   * @param {Array<string>} colors - Array of hex colors to use
   * @param {Array<Array<number>>} pattern - 2D pattern array (0 = transparent, 1+ = color index)
   * @returns {string} Data URL of the generated sprite
   */
    generatePixelSprite(name, width, height, colors, pattern) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        ctx.fillRect(0, 0, width, height);

        const pixelSize = Math.max(1, Math.floor(width / pattern[0].length));
        for (let row = 0; row < pattern.length; row++) {
            for (let col = 0; col < pattern[row].length; col++) {
                const colorIndex = pattern[row][col];
                if (colorIndex > 0 && colorIndex - 1 < colors.length) {
                    ctx.fillStyle = colors[colorIndex - 1];
                    ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
                }
            }
        }

        return canvas.toDataURL('image/png');
    }

    async loadSprite(name, src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.sprites.set(name, img);
                resolve(img);
            };
            img.onerror = () => reject(new Error(`Failed to load sprite: ${name}`));
            img.src = src;
        });
    }

    registerAnimation(animationName, spriteName, frameCount, frameDuration) {
        this.animations.set(animationName, {
            spriteName,
            frameCount,
            frameDuration,
            totalDuration: frameCount * frameDuration,
        });
    }

    getAnimationFrame(animationName, elapsed) {
        const animation = this.animations.get(animationName);
        if (!animation) return 0;
    
        const cycleTime = elapsed % animation.totalDuration;
        return Math.floor(cycleTime / animation.frameDuration);
    }

    getSprite(name) {
        return this.sprites.get(name) || null;
    }

    renderSprite(ctx, spriteName, x, y, width, height) {
        const sprite = this.getSprite(spriteName);
        if (sprite) {
            ctx.drawImage(sprite, x, y, width, height);
        }
    }

    renderAnimation(ctx, animationName, elapsed, x, y, width, height) {
        const animation = this.animations.get(animationName);
        if (!animation) return;

        const frameIndex = this.getAnimationFrame(animationName, elapsed);
        const frameSpriteName = `${animation.spriteName}_frame_${frameIndex}`;
        this.renderSprite(ctx, frameSpriteName, x, y, width, height);
    }

    clear() {
        this.sprites.clear();
        this.animations.clear();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SpriteManager };
}
