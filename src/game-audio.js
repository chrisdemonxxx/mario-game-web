/* eslint-disable no-undef */
// Game Audio Controller - High-level audio interface
const AudioManager = require('./audio');

class GameAudioController {
    constructor() {
        if (GameAudioController.instance) {
            return GameAudioController.instance;
        }
        this.audioManager = new AudioManager();
        this.sounds = {};
        GameAudioController.instance = this;
    }

    static getInstance() {
        if (!GameAudioController.instance) {
            GameAudioController.instance = new GameAudioController();
        }
        return GameAudioController.instance;
    }

    setVolume(level) {
        if (this.audioManager && this.audioManager.setVolume) {
            this.audioManager.setVolume(level);
        }
    }

    getVolume() {
        if (this.audioManager && this.audioManager.getVolume) {
            return this.audioManager.getVolume();
        }
        return 0.7;
    }

    playSound(soundName) {
        if (this.audioManager && this.audioManager.playSound) {
            return this.audioManager.playSound(soundName);
        }
        return null;
    }

    mute() {
        if (this.audioManager && this.audioManager.toggle) {
            this.audioManager.toggle();
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameAudioController;
}