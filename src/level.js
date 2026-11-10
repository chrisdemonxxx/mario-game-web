/**
 * Level Manager - handles level loading, switching, and state
 */
class LevelManager {
    constructor() {
        this.levels = [];
        this.currentLevelIndex = 0;
        this.completedLevels = [];
    }
    
    async loadLevels(url) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            this.levels = data.levels || data;
            return true;
        } catch (error) {
            console.error('Failed to load levels:', error);
            return false;
        }
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
        return false; // Game complete
    }
    
    restartLevel() {
        // Reset to beginning of current level
        return true;
    }
    
    goToLevel(index) {
        if (index >= 0 && index < this.levels.length) {
            this.currentLevelIndex = index;
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
