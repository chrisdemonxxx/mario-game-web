// Audio Manager class - Web Audio API wrapper
class AudioManager {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.volume = 0.7;
    this.muted = false;
    this.sounds = {};
    this.initAudioContext();
  }

  initAudioContext() {
    if (typeof window !== 'undefined' && window.AudioContext) {
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
        this.masterGain.gain.value = this.volume;
      } catch (e) {
        console.warn('Web Audio API not available:', e);
      }
    }
  }

  setVolume(level) {
    this.volume = Math.max(0, Math.min(1, level));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
  }

  getVolume() {
    return this.volume;
  }

  toggle() {
    this.muted = !this.muted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : this.volume;
    }
  }

  loadSound(name, audioBuffer) {
    this.sounds[name] = audioBuffer;
  }

  playSound(name) {
    if (!this.sounds[name] || !this.audioContext) {
      return null;
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = this.sounds[name];
    source.connect(this.masterGain);
    source.start(0);
    return source;
  }
}

function initAudioManager() {
  return new AudioManager();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioManager;
  module.exports.initAudioManager = initAudioManager;
}