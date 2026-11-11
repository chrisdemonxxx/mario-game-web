// Audio Manager - Handles sound playback with Web Audio API

class AudioManager {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.masterVolume = 0.7;
    this.isMuted = false;
    this.sounds = new Map();
  }

  registerSound(name, audioNode) {
    this.sounds.set(name, audioNode);
  }

  playSound(name) {
    if (!this.isMuted && this.sounds.has(name)) {
      const node = this.sounds.get(name);
      if (node && node.play) {
        node.play();
      }
    }
  }

  setVolume(level) {
    this.masterVolume = Math.max(0, Math.min(1, level));
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
  }

  getVolume() {
    return this.isMuted ? 0 : this.masterVolume;
  }
}

function initAudioManager() {
  return new AudioManager();
}

module.exports = { AudioManager, initAudioManager };
