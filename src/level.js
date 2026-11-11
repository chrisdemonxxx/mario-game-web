class Level {
  constructor() {
    this.currentLevel = 0;
    this.completedLevels = [];
    this.score = 0;
    this.levelData = [
      { platforms: [{ x: 0, y: 550, width: 800, height: 50 }], enemies: [{ x: 200, y: 500, minX: 150, maxX: 250 }], coins: [{ x: 150, y: 450 }, { x: 250, y: 400 }], goal: { x: 700, y: 450 } },
      { platforms: [{ x: 0, y: 550, width: 800, height: 50 }, { x: 150, y: 450, width: 300, height: 20 }, { x: 500, y: 350, width: 250, height: 20 }], enemies: [{ x: 200, y: 400, minX: 150, maxX: 300 }, { x: 550, y: 300, minX: 500, maxX: 650 }], coins: [{ x: 200, y: 400 }, { x: 550, y: 300 }], goal: { x: 700, y: 250 } },
      { platforms: [{ x: 0, y: 550, width: 800, height: 50 }, { x: 100, y: 450, width: 200, height: 20 }, { x: 400, y: 400, width: 200, height: 20 }, { x: 650, y: 300, width: 150, height: 20 }], enemies: [{ x: 150, y: 400, minX: 100, maxX: 250 }, { x: 450, y: 350, minX: 400, maxX: 550 }, { x: 700, y: 250, minX: 650, maxX: 750 }], coins: [{ x: 150, y: 400 }, { x: 450, y: 350 }, { x: 700, y: 250 }], goal: { x: 750, y: 200 } }
    ];
  }

  getLevelData(index) {
    return this.levelData[index] || null;
  }

  nextLevel() {
    if (this.currentLevel < this.levelData.length - 1) {
      this.currentLevel++;
    }
  }

  previousLevel() {
    if (this.currentLevel > 0) {
      this.currentLevel--;
    }
  }

  completeLevel() {
    if (!this.completedLevels.includes(this.currentLevel)) {
      this.completedLevels.push(this.currentLevel);
    }
  }

  addScore(points) {
    this.score += points;
  }
}

module.exports = Level;
