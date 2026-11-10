/**
 * AudioManager - Handles all game audio using Web Audio API
 * Supports sound effects, background music, and volume control
 */
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.8; // 80% default
        this.sfxVolume = 0.7;    // Sound effects volume
        this.musicVolume = 0.6;  // Background music volume
        this.isMuted = false;
        this.isEnabled = true;
        
        // Audio buffers cache
        this.soundBuffers = {};
        this.musicBuffers = {};
        
        // Active audio sources (sound pooling)
        this.activeSources = [];
        this.maxConcurrentSounds = 3;
        
        // Current background music
        this.currentMusicSource = null;
        this.currentMusicGain = null;
        
        this.initAudioContext();
    }
    
    initAudioContext() {
        try {
            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            console.log('AudioManager: Web Audio API initialized');
        } catch (e) {
            console.warn('AudioManager: Web Audio API not supported', e);
            this.isEnabled = false;
        }
    }
    
    /**
     * Load a sound effect from URL
     * @param {string} name - Unique identifier for the sound
     * @param {string} url - URL to the audio file
     */
    async loadSoundEffect(name, url) {
        if (!this.isEnabled || !this.audioContext) return false;
        
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.soundBuffers[name] = audioBuffer;
            console.log(`AudioManager: Loaded sound effect "${name}"`);
            return true;
        } catch (error) {
            console.error(`AudioManager: Failed to load sound "${name}"`, error);
            return false;
        }
    }
    
    /**
     * Load background music from URL
     * @param {string} name - Unique identifier for the music
     * @param {string} url - URL to the audio file
     */
    async loadMusic(name, url) {
        if (!this.isEnabled || !this.audioContext) return false;
        
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.musicBuffers[name] = audioBuffer;
            console.log(`AudioManager: Loaded music "${name}"`);
            return true;
        } catch (error) {
            console.error(`AudioManager: Failed to load music "${name}"`, error);
            return false;
        }
    }
    
    /**
     * Play a sound effect with sound pooling
     * @param {string} soundName - Name of the sound effect to play
     * @param {number} volume - Optional volume override (0-1)
     */
    playSound(soundName, volume = 1.0) {
        if (!this.isEnabled || !this.audioContext || this.isMuted) return;
        
        const buffer = this.soundBuffers[soundName];
        if (!buffer) {
            console.warn(`AudioManager: Sound "${soundName}" not found`);
            return;
        }
        
        // Clean up finished sources
        this.activeSources = this.activeSources.filter(source => source.endTime > this.audioContext.currentTime);
        
        // If at max concurrent sounds, don't play new one
        if (this.activeSources.length >= this.maxConcurrentSounds) {
            return;
        }
        
        // Create and configure audio nodes
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Set volume
        const finalVolume = this.isMuted ? 0 : this.masterVolume * this.sfxVolume * volume;
        gainNode.gain.setValueAtTime(finalVolume, this.audioContext.currentTime);
        
        // Play sound
        const startTime = this.audioContext.currentTime;
        source.start(startTime);
        
        // Track source for pooling
        this.activeSources.push({
            source: source,
            endTime: startTime + buffer.duration
        });
    }
    
    /**
     * Play background music (looping)
     * @param {string} musicName - Name of the music track to play
     * @param {number} fadeInTime - Time to fade in (seconds)
     */
    playMusic(musicName, fadeInTime = 0.5) {
        if (!this.isEnabled || !this.audioContext) return;
        
        const buffer = this.musicBuffers[musicName];
        if (!buffer) {
            console.warn(`AudioManager: Music "${musicName}" not found`);
            return;
        }
        
        // Stop current music if playing
        if (this.currentMusicSource) {
            this.stopMusic(0.3);
        }
        
        // Create new music source
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = buffer;
        source.loop = true;
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Fade in effect
        const startVolume = this.isMuted ? 0 : this.masterVolume * this.musicVolume;
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(startVolume, this.audioContext.currentTime + fadeInTime);
        
        // Play music
        source.start(this.audioContext.currentTime);
        
        this.currentMusicSource = source;
        this.currentMusicGain = gainNode;
    }
    
    /**
     * Stop background music with fade out
     * @param {number} fadeOutTime - Time to fade out (seconds)
     */
    stopMusic(fadeOutTime = 0.5) {
        if (!this.currentMusicSource || !this.currentMusicGain) return;
        
        const stopTime = this.audioContext.currentTime + fadeOutTime;
        this.currentMusicGain.gain.linearRampToValueAtTime(0, stopTime);
        this.currentMusicSource.stop(stopTime);
        
        this.currentMusicSource = null;
        this.currentMusicGain = null;
    }
    
    /**
     * Set master volume (0-100)
     * @param {number} percentage - Volume as percentage (0-100)
     */
    setVolume(percentage) {
        this.masterVolume = Math.max(0, Math.min(1, percentage / 100));
        this.updateMusicVolume();
    }
    
    /**
     * Update current music volume
     */
    updateMusicVolume() {
        if (this.currentMusicGain && this.audioContext) {
            const volume = this.isMuted ? 0 : this.masterVolume * this.musicVolume;
            this.currentMusicGain.gain.setValueAtTime(volume, this.audioContext.currentTime);
        }
    }
    
    /**
     * Mute/unmute all audio
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.updateMusicVolume();
        return this.isMuted;
    }
    
    /**
     * Mute audio
     */
    mute() {
        this.isMuted = true;
        this.updateMusicVolume();
    }
    
    /**
     * Unmute audio
     */
    unmute() {
        this.isMuted = false;
        this.updateMusicVolume();
    }
    
    /**
     * Get current master volume (0-100)
     */
    getVolume() {
        return this.masterVolume * 100;
    }
    
    /**
     * Resume audio context if suspended
     */
    resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                console.log('AudioManager: Audio context resumed');
            });
        }
    }
}

/**
 * Global audio manager instance
 */
let audioManager = null;

function initAudioManager() {
    if (!audioManager) {
        audioManager = new AudioManager();
    }
    return audioManager;
}
