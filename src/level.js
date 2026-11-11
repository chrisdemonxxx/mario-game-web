class Level {
    constructor(levelId, canvas) {
        this.levelId = levelId;
        this.canvas = canvas;
        this.completed = false;
    }

    next() {
        return new Level(this.levelId + 1, this.canvas);
    }

    previous() {
        return new Level(Math.max(1, this.levelId - 1), this.canvas);
    }

    static selectByIndex(index) {
        return new Level(index);
    }

    static getLevelCount() {
        return 3;
    }

    markCompleted() {
        this.completed = true;
    }

    isCompleted() {
        return this.completed;
    }

    isInProgress() {
        return !this.completed;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Level };
}
