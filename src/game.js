/* global Player, Enemy, LevelManager */
/**
 * Main Game Engine - Canvas platformer game
 */
const Player = require('./player');
const Enemy = require('./enemy');
const LevelManager = require('./level');
// eslint-disable-next-line no-unused-vars
class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.gameRunning = true;
        this.gamePaused = false;
        this.player = null;
        this.enemies = [];
        this.collectibles = [];
        this.levelManager = null;
        this.currentTilemap = [];
        this.gameLoopId = null;
    }
    
    loadLevels(filePath) {
        return fetch(filePath).then(res => res.json()).then(data => {
            this.levels = data;
            this.levelManager = new LevelManager();
            this.levelManager.loadLevels(this.levels);
            this.initLevel(0);
        });
    }
