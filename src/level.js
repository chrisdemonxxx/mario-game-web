// Level management for Mario Game
const LEVEL_DATA = {
    levels: [
        {
            name: 'Tutorial',
            platforms: [
                { x: 0, y: 560, width: 800, height: 40 }, // Ground
                { x: 150, y: 480, width: 150, height: 20 },
                { x: 450, y: 400, width: 150, height: 20 },
            ],
            enemies: [
                { x: 250, y: 530, minX: 200, maxX: 350 },
            ],
            coins: [
                { x: 225, y: 450 },
                { x: 525, y: 370 },
                { x: 600, y: 530 },
            ],
            goal: { x: 750, y: 500, width: 40, height: 40 },
        },
        {
            name: 'Intermediate',
            platforms: [
                { x: 0, y: 560, width: 800, height: 40 },
                { x: 100, y: 460, width: 120, height: 20 },
                { x: 280, y: 380, width: 120, height: 20 },
                { x: 460, y: 300, width: 120, height: 20 },
                { x: 640, y: 380, width: 120, height: 20 },
            ],
            enemies: [
                { x: 180, y: 430, minX: 100, maxX: 250 },
                { x: 360, y: 350, minX: 280, maxX: 430 },
            ],
            coins: [
                { x: 160, y: 430 },
                { x: 340, y: 350 },
                { x: 520, y: 270 },
                { x: 700, y: 350 },
            ],
            goal: { x: 750, y: 350, width: 40, height: 40 },
        },
        {
            name: 'Advanced',
            platforms: [
                { x: 0, y: 560, width: 800, height: 40 },
                { x: 50, y: 460, width: 100, height: 20 },
                { x: 200, y: 380, width: 100, height: 20 },
                { x: 350, y: 300, width: 100, height: 20 },
                { x: 500, y: 380, width: 100, height: 20 },
                { x: 650, y: 300, width: 100, height: 20 },
            ],
            enemies: [
                { x: 120, y: 430, minX: 50, maxX: 200 },
                { x: 270, y: 350, minX: 200, maxX: 350 },
                { x: 420, y: 270, minX: 350, maxX: 500 },
                { x: 570, y: 350, minX: 500, maxX: 650 },
            ],
            coins: [
                { x: 100, y: 430 },
                { x: 250, y: 350 },
                { x: 400, y: 270 },
                { x: 550, y: 350 },
                { x: 700, y: 270 },
            ],
            goal: { x: 750, y: 270, width: 40, height: 40 },
        },
    ],
};

class Level {
    constructor() {
        this.levels = LEVEL_DATA.levels;
        this.currentLevelIndex = 0;
        this.completedLevels = [];
        this.platforms = [];
        this.enemies = [];
        this.coins = [];
        this.goal = null;
    }

    loadLevel(index) {
        if (index < 0 || index >= this.levels.length) {
            return false;
        }

        this.currentLevelIndex = index;
        const levelData = this.levels[index];

        this.platforms = [...levelData.platforms];
        this.enemies = levelData.enemies.map(e => ({
            x: e.x,
            y: e.y,
            minX: e.minX,
            maxX: e.maxX,
        }));
        this.coins = [...levelData.coins];
        this.goal = { ...levelData.goal };

        return true;
    }

    nextLevel() {
        if (this.currentLevelIndex < this.levels.length - 1) {
            this.currentLevelIndex++;
            this.loadLevel(this.currentLevelIndex);
            return true;
        }
        return false; // Game complete
    }

    previousLevel() {
        if (this.currentLevelIndex > 0) {
            this.currentLevelIndex--;
            this.loadLevel(this.currentLevelIndex);
            return true;
        }
        return false;
    }

    completeLevel(index) {
        if (!this.completedLevels.includes(index)) {
            this.completedLevels.push(index);
            return true;
        }
        return false;
    }

    getLevelName() {
        return this.levels[this.currentLevelIndex].name;
    }
}

module.exports = Level;