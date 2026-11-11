// Audio Manager - Web Audio API implementation for game sounds
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.7;
        this.isMuted = false;
        this.gainNode = null;
        this.sounds = {};
        this.backgroundMusicOscillators = [];
        this.backgroundMusicPlaying = false;
        this.initAudioContext();
    }

    initAudioContext() {
        // Initialize Web Audio API context
        if (typeof window !== 'undefined') {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioContext = new AudioContext();
                this.gainNode = this.audioContext.createGain();
                this.gainNode.connect(this.audioContext.destination);
                this.gainNode.gain.value = this.masterVolume;
            }
        }
    }

    setVolume(level) {
        if (level < 0) level = 0;
        if (level > 1) level = 1;
        this.masterVolume = level;
        if (this.gainNode) {
            this.gainNode.gain.value = this.isMuted ? 0 : level;
        }
    }

    getVolume() {
        return this.masterVolume;
    }

    toggle() {
        this.isMuted = !this.isMuted;
        if (this.gainNode) {
            this.gainNode.gain.value = this.isMuted ? 0 : this.masterVolume;
        }
    }

    mute() {
        this.isMuted = true;
        if (this.gainNode) {
            this.gainNode.gain.value = 0;
        }
    }

    unmute() {
        this.isMuted = false;
        if (this.gainNode) {
            this.gainNode.gain.value = this.masterVolume;
        }
    }

    isMutedState() {
        return this.isMuted;
    }

    playSound(soundName) {
        if (!this.audioContext || this.audioContext.state === 'suspended') {
            return null;
        }

        const currentTime = this.audioContext.currentTime;

        switch (soundName) {
            case 'jump':
                return this.playJumpSound(currentTime);
            case 'coin':
                return this.playCoinSound(currentTime);
            case 'enemyDefeat':
                return this.playEnemyDefeatSound(currentTime);
            case 'powerup':
                return this.playPowerUpSound(currentTime);
            case 'gameOver':
                return this.playGameOverSound(currentTime);
            default:
                return null;
        }
    }

    playJumpSound(startTime) {
        // Quick ascending pitch sweep for jump
        const oscillator = this.audioContext.createOscillator();
        const envelope = this.audioContext.createGain();

        oscillator.connect(envelope);
        envelope.connect(this.gainNode);

        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(400, startTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, startTime + 0.1);

        envelope.gain.setValueAtTime(0.3, startTime);
        envelope.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.1);

        return { oscillator, envelope };
    }

    playCoinSound(startTime) {
        // Ascending musical notes for coin collection
        const notes = [523, 659, 784]; // C5, E5, G5
        const noteDuration = 0.15;

        notes.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const envelope = this.audioContext.createGain();

            oscillator.connect(envelope);
            envelope.connect(this.gainNode);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, startTime + noteDuration * index);

            envelope.gain.setValueAtTime(0.2, startTime + noteDuration * index);
            envelope.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration * index + noteDuration * 0.8);

            oscillator.start(startTime + noteDuration * index);
            oscillator.stop(startTime + noteDuration * index + noteDuration);
        });

        return { playedNotes: notes.length };
    }

    playEnemyDefeatSound(startTime) {
        // Descending tone for enemy defeat
        const oscillator = this.audioContext.createOscillator();
        const envelope = this.audioContext.createGain();

        oscillator.connect(envelope);
        envelope.connect(this.gainNode);

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(400, startTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, startTime + 0.3);

        envelope.gain.setValueAtTime(0.3, startTime);
        envelope.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.3);

        return { oscillator, envelope };
    }

    playPowerUpSound(startTime) {
        // Rising pitch sequence for power-up
        const frequencies = [330, 440, 550, 660];
        const noteDuration = 0.1;

        frequencies.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const envelope = this.audioContext.createGain();

            oscillator.connect(envelope);
            envelope.connect(this.gainNode);

            oscillator.type = 'sine';
            oscillator.frequency.value = freq;

            envelope.gain.setValueAtTime(0.25, startTime + noteDuration * index);
            envelope.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration * (index + 1));

            oscillator.start(startTime + noteDuration * index);
            oscillator.stop(startTime + noteDuration * (index + 1));
        });

        return { playedNotes: frequencies.length };
    }

    playGameOverSound(startTime) {
        // Sad descending progression for game over
        const frequencies = [400, 300, 200];
        const noteDuration = 0.3;

        frequencies.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const envelope = this.audioContext.createGain();

            oscillator.connect(envelope);
            envelope.connect(this.gainNode);

            oscillator.type = 'sine';
            oscillator.frequency.value = freq;

            envelope.gain.setValueAtTime(0.3, startTime + noteDuration * index);
            envelope.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration * (index + 1));

            oscillator.start(startTime + noteDuration * index);
            oscillator.stop(startTime + noteDuration * (index + 1));
        });

        return { playedNotes: frequencies.length };
    }

    playBackgroundMusic() {
        if (this.backgroundMusicPlaying || !this.audioContext) {
            return;
        }

        this.backgroundMusicPlaying = true;
        this.generateBackgroundMusicLoop();
    }

    stopBackgroundMusic() {
        this.backgroundMusicPlaying = false;
        this.backgroundMusicOscillators.forEach(osc => {
            try {
                osc.stop();
            } catch (e) {
                // Oscillator already stopped
            }
        });
        this.backgroundMusicOscillators = [];
    }

    generateBackgroundMusicLoop() {
        // Simple 8-bit chiptune background music loop
        // Uses a repeating pattern at ~120 BPM
        if (!this.backgroundMusicPlaying || !this.audioContext) {
            return;
        }

        const startTime = this.audioContext.currentTime;
        const bpm = 120;
        const beatDuration = 60 / bpm; // Duration of one beat
        const barDuration = beatDuration * 4; // 4 beats per bar

        // Melody pattern (frequencies)
        const melody = [
            [330, 0.5], [330, 0.5], [392, 0.5], [440, 0.5],  // Bar 1
            [440, 0.5], [392, 0.5], [330, 0.5], [330, 0.5],  // Bar 2
            [392, 0.5], [392, 0.5], [392, 0.5], [330, 0.5],  // Bar 3
            [330, 0.5], [330, 0.5], [392, 0.5], [330, 0.5]   // Bar 4
        ];

        let beatTime = startTime;
        melody.forEach(([freq, duration]) => {
            if (this.backgroundMusicPlaying) {
                const oscillator = this.audioContext.createOscillator();
                const envelope = this.audioContext.createGain();

                oscillator.connect(envelope);
                envelope.connect(this.gainNode);

                oscillator.type = 'square';
                oscillator.frequency.value = freq;

                const noteDuration = beatDuration * duration;
                envelope.gain.setValueAtTime(0.15, beatTime);
                envelope.gain.linearRampToValueAtTime(0.15, beatTime + noteDuration * 0.9);
                envelope.gain.exponentialRampToValueAtTime(0.01, beatTime + noteDuration);

                oscillator.start(beatTime);
                oscillator.stop(beatTime + noteDuration);

                this.backgroundMusicOscillators.push(oscillator);
                beatTime += noteDuration;
            }
        });

        // Recursively loop the background music
        if (this.backgroundMusicPlaying) {
            setTimeout(() => this.generateBackgroundMusicLoop(), barDuration * 4 * 1000);
        }
    }

    resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}

// Singleton instance
let audioManagerInstance = null;

function getAudioManager() {
    if (!audioManagerInstance) {
        audioManagerInstance = new AudioManager();
    }
    return audioManagerInstance;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = getAudioManager();
    module.exports.AudioManager = AudioManager;
}
