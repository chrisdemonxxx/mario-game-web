/* global module */
/**
 * LevelManager class - handles level data, tilemaps, and progression
 */
// eslint-disable-next-line no-unused-vars
class LevelManager {
    constructor() {
        this.levels = [];
        this.currentLevelIndex = 0;
        this.completedLevels = [];
    }
    
    loadLevels(levels) {
        this.levels = levels;
    }
    
    getCurrentLevel() {
        return this.levels[this.currentLevelIndex];
    }
    
    nextLevel() {
        if (this.currentLevelIndex < this.levels.length - 1) {
            this.completedLevels.push(this.currentLevelIndex);
            this.currentLevelIndex++;
            return true;
        }
        return false;
    }
    
    completeLevel(levelIndex = this.currentLevelIndex) {
        if (this.completedLevels.indexOf(levelIndex) === -1) {
            this.completedLevels.push(levelIndex);
            return true;
        }
        return false;
    }
    
    getLevelCount() {
        return this.levels.length;
    }
    
    getProgress() {
        return {
            current: this.currentLevelIndex + 1,
            total: this.levels.length,
            completed: this.completedLevels.length
        };
    }
}

if (typeof module !== 'undefined' && module.exports) { module.exports = LevelManager; }