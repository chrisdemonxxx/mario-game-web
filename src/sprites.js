/* eslint-disable no-undef */
// Sprite Manager class for handling sprite assets
class SpriteManager {
    constructor() {
        this.sprites = {};
        this.spriteSheets = {};
        this.loadedAssets = {};
    }

    registerSprite(name, spriteData) {
        this.sprites[name] = {
            name: name,
            ...spriteData
        };
        return true;
    }

    getSprite(name) {
        return this.sprites[name] || null;
    }

    registerSpriteSheet(name, sheetData) {
        this.spriteSheets[name] = {
            name: name,
            ...sheetData
        };
        return true;
    }

    getSpriteSheet(name) {
        return this.spriteSheets[name] || null;
    }

    loadAsset(name, assetData) {
        this.loadedAssets[name] = assetData;
        return true;
    }

    getAsset(name) {
        return this.loadedAssets[name] || null;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SpriteManager;
}
