// Level System for Mario Game
// Manages game levels, progression, and level data

class Level {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.width = data.width;
        this.height = data.height;
        this.tiles = data.tiles;
        this.coins = data.coins || [];
        this.enemies = data.enemies || [];
        this.goal = data.goal;
        this.completed = false;
    }

    getTile(row, col) {
        if (row < 0 || row >= this.tiles.length || col < 0 || col >= this.tiles[0].length) {
            return 0;
        }
        return this.tiles[row][col];
    }

    setTile(row, col, value) {
        if (row >= 0 && row < this.tiles.length && col >= 0 && col < this.tiles[0].length) {
            this.tiles[row][col] = value;
        }
    }
}

class LevelManager {
    constructor(levels) {
        this.levels = levels.map(data => new Level(data));
        this.currentLevelIndex = 0;
        this.score = 0;
        this.coinsCollected = 0;
    }

    getCurrentLevel() {
        return this.levels[this.currentLevelIndex];
    }

    getLevel(index) {
        if (index >= 0 && index < this.levels.length) {
            return this.levels[index];
        }
        return null;
    }

    nextLevel() {
        if (this.currentLevelIndex < this.levels.length - 1) {
            this.currentLevelIndex++;
            return true;
        }
        return false;
    }

    completeLevel(score) {
        this.getCurrentLevel().completed = true;
        this.score += score;
        return this.nextLevel();
    }

    collectCoin(amount = 10) {
        this.score += amount;
        this.coinsCollected++;
    }

    reset() {
        this.currentLevelIndex = 0;
        this.score = 0;
        this.coinsCollected = 0;
        this.levels.forEach(level => {
            level.completed = false;
        });
    }

    getTotalLevels() {
        return this.levels.length;
    }

    getCurrentLevelIndex() {
        return this.currentLevelIndex;
    }

    getScore() {
        return this.score;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Level, LevelManager };
}
