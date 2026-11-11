const { Level, LevelManager } = require('../src/level');

describe('Level System', () => {
    let levelData;
    let level;

    beforeEach(() => {
        levelData = {
            id: 1,
            name: 'Test Level',
            width: 800,
            height: 600,
            tiles: [
                [0, 0, 0, 1, 1, 1],
                [0, 0, 0, 0, 0, 0],
                [1, 1, 0, 1, 0, 1]
            ],
            coins: [[1, 2], [2, 3]],
            enemies: [[1, 4]],
            goal: [2, 5]
        };
        level = new Level(levelData);
    });

    describe('Level class', () => {
        test('should initialize with correct data', () => {
            expect(level.id).toBe(1);
            expect(level.name).toBe('Test Level');
            expect(level.width).toBe(800);
            expect(level.height).toBe(600);
            expect(level.tiles.length).toBe(3);
            expect(level.completed).toBe(false);
        });

        test('should get tile value', () => {
            expect(level.getTile(0, 0)).toBe(0);
            expect(level.getTile(0, 3)).toBe(1);
            expect(level.getTile(2, 0)).toBe(1);
        });

        test('should set tile value', () => {
            level.setTile(1, 1, 1);
            expect(level.getTile(1, 1)).toBe(1);
        });

        test('should handle out of bounds gracefully', () => {
            expect(level.getTile(-1, 0)).toBe(0);
            expect(level.getTile(10, 10)).toBe(0);
            level.setTile(-1, 0, 1);
            level.setTile(10, 10, 1);
            expect(level.getTile(-1, 0)).toBe(0);
            expect(level.getTile(10, 10)).toBe(0);
        });

        test('should store coins and enemies', () => {
            expect(level.coins.length).toBe(2);
            expect(level.enemies.length).toBe(1);
            expect(level.goal).toEqual([2, 5]);
        });
    });

    describe('LevelManager class', () => {
        let manager;
        let levelsData;

        beforeEach(() => {
            levelsData = [
                {
                    id: 1,
                    name: 'Level 1',
                    width: 800,
                    height: 600,
                    tiles: [[1, 1, 1, 1]],
                    coins: [[1, 1]],
                    enemies: [],
                    goal: [3, 0]
                },
                {
                    id: 2,
                    name: 'Level 2',
                    width: 800,
                    height: 600,
                    tiles: [[1, 1, 1, 1]],
                    coins: [[2, 1]],
                    enemies: [],
                    goal: [3, 0]
                }
            ];
            manager = new LevelManager(levelsData);
        });

        test('should initialize with correct number of levels', () => {
            expect(manager.getTotalLevels()).toBe(2);
            expect(manager.getCurrentLevelIndex()).toBe(0);
        });

        test('should get current level', () => {
            expect(manager.getCurrentLevel().id).toBe(1);
            expect(manager.getCurrentLevel().name).toBe('Level 1');
        });

        test('should get specific level by index', () => {
            expect(manager.getLevel(0).id).toBe(1);
            expect(manager.getLevel(1).id).toBe(2);
            expect(manager.getLevel(5)).toBe(null);
        });

        test('should progress to next level', () => {
            expect(manager.getCurrentLevelIndex()).toBe(0);
            expect(manager.nextLevel()).toBe(true);
            expect(manager.getCurrentLevelIndex()).toBe(1);
            expect(manager.nextLevel()).toBe(false);
            expect(manager.getCurrentLevelIndex()).toBe(1);
        });

        test('should complete level and progress', () => {
            expect(manager.getScore()).toBe(0);
            expect(manager.completeLevel(100)).toBe(true);
            expect(manager.getScore()).toBe(100);
            expect(manager.getCurrentLevelIndex()).toBe(1);
            expect(manager.getLevel(0).completed).toBe(true);
        });

        test('should collect coins', () => {
            expect(manager.coinsCollected).toBe(0);
            manager.collectCoin(10);
            expect(manager.coinsCollected).toBe(1);
            expect(manager.getScore()).toBe(10);
            manager.collectCoin(5);
            expect(manager.coinsCollected).toBe(2);
            expect(manager.getScore()).toBe(15);
        });

        test('should reset level manager', () => {
            manager.completeLevel(100);
            manager.collectCoin(50);
            expect(manager.getScore()).toBe(150);
            manager.reset();
            expect(manager.getCurrentLevelIndex()).toBe(0);
            expect(manager.getScore()).toBe(0);
            expect(manager.coinsCollected).toBe(0);
            expect(manager.getCurrentLevel().completed).toBe(false);
        });

        test('should return false when all levels complete', () => {
            manager.completeLevel(100);
            expect(manager.completeLevel(100)).toBe(false);
            expect(manager.getCurrentLevelIndex()).toBe(1);
        });
    });
});
