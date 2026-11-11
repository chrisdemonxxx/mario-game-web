// Game Audio Controller - Manages game sound effects and music

const { AudioManager } = require('./audio');

class GameAudioController {
  constructor() {
    this.audioManager = new AudioManager();
  }

  playSoundEffect(effectName) {
    this.audioManager.playSound(effectName);
  }

  setVolume(level) {
    this.audioManager.setVolume(level);
  }

  toggleMute() {
    this.audioManager.toggleMute();
  }

  getVolume() {
    return this.audioManager.getVolume();
  }
}

module.exports = GameAudioController;
