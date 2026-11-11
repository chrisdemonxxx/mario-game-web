/* eslint-disable no-undef */
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

    registerSound(name, source) {
        this.sounds[name] = source;
    }

    playSound(soundName) {
        if (this.sounds[soundName]) {
            return this.sounds[soundName];
        }
        return null;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
    module.exports.initAudioManager = function initAudioManager() {
        return new AudioManager();
    };
}