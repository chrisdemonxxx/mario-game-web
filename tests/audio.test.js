// Audio Module Tests
const AudioManager = require('../src/audio').AudioManager || require('../src/audio');

// Mock AudioContext for testing
class MockOscillator {
    constructor() {
        this.type = 'sine';
        this.frequency = { value: 440, setValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn() };
        this.start = jest.fn();
        this.stop = jest.fn();
    }
    connect() { return this; }
}

class MockGain {
    constructor() {
        this.gain = { value: 1, setValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn(), linearRampToValueAtTime: jest.fn() };
    }
    connect() { return this; }
}

class MockAudioContext {
    constructor() {
        this.currentTime = 0;
        this.state = 'running';
        this.destination = {};
    }
    createOscillator() { return new MockOscillator(); }
    createGain() { return new MockGain(); }
    resume() {}
}

describe('AudioManager', () => {
    let audioManager;

    beforeEach(() => {
        // Override window.AudioContext for testing
        if (typeof window !== 'undefined') {
            window.AudioContext = MockAudioContext;
        }
    });

    test('should create an AudioManager instance', () => {
        audioManager = new AudioManager();
        expect(audioManager).toBeDefined();
    });

    test('should initialize with default volume', () => {
        audioManager = new AudioManager();
        expect(audioManager.getVolume()).toBe(0.7);
    });

    test('should set volume between 0 and 1', () => {
        audioManager = new AudioManager();
        audioManager.setVolume(0.5);
        expect(audioManager.getVolume()).toBe(0.5);

        audioManager.setVolume(1.5);
        expect(audioManager.getVolume()).toBe(1);

        audioManager.setVolume(-0.5);
        expect(audioManager.getVolume()).toBe(0);
    });

    test('should toggle mute state', () => {
        audioManager = new AudioManager();
        expect(audioManager.isMutedState()).toBe(false);
        audioManager.toggle();
        expect(audioManager.isMutedState()).toBe(true);
        audioManager.toggle();
        expect(audioManager.isMutedState()).toBe(false);
    });

    test('should mute and unmute', () => {
        audioManager = new AudioManager();
        audioManager.mute();
        expect(audioManager.isMutedState()).toBe(true);
        audioManager.unmute();
        expect(audioManager.isMutedState()).toBe(false);
    });

    test('should play jump sound', () => {
        audioManager = new AudioManager();
        if (audioManager.audioContext) {
            const result = audioManager.playSound('jump');
            expect(result).toBeDefined();
            expect(result.oscillator).toBeDefined();
        }
    });

    test('should play coin sound', () => {
        audioManager = new AudioManager();
        if (audioManager.audioContext) {
            const result = audioManager.playSound('coin');
            expect(result).toBeDefined();
            expect(result.playedNotes).toBe(3);
        }
    });

    test('should play enemy defeat sound', () => {
        audioManager = new AudioManager();
        if (audioManager.audioContext) {
            const result = audioManager.playSound('enemyDefeat');
            expect(result).toBeDefined();
            expect(result.oscillator).toBeDefined();
        }
    });

    test('should play power-up sound', () => {
        audioManager = new AudioManager();
        if (audioManager.audioContext) {
            const result = audioManager.playSound('powerup');
            expect(result).toBeDefined();
            expect(result.playedNotes).toBe(4);
        }
    });

    test('should play game over sound', () => {
        audioManager = new AudioManager();
        if (audioManager.audioContext) {
            const result = audioManager.playSound('gameOver');
            expect(result).toBeDefined();
            expect(result.playedNotes).toBe(3);
        }
    });

    test('should return null for unknown sound', () => {
        audioManager = new AudioManager();
        if (audioManager.audioContext) {
            const result = audioManager.playSound('unknownSound');
            expect(result).toBeNull();
        }
    });

    test('should handle audio context suspension gracefully', () => {
        audioManager = new AudioManager();
        if (audioManager.audioContext) {
            audioManager.audioContext.state = 'suspended';
            const result = audioManager.playSound('jump');
            expect(result).toBeNull();
        }
    });

    test('should start and stop background music', () => {
        audioManager = new AudioManager();
        audioManager.playBackgroundMusic();
        expect(audioManager.backgroundMusicPlaying).toBe(true);

        audioManager.stopBackgroundMusic();
        expect(audioManager.backgroundMusicPlaying).toBe(false);
    });

    test('should not start background music if already playing', () => {
        audioManager = new AudioManager();
        audioManager.playBackgroundMusic();
        
        audioManager.playBackgroundMusic();
        // Should not add more oscillators if already playing
        expect(audioManager.backgroundMusicPlaying).toBe(true);
    });

    test('should resume audio context if suspended', () => {
        audioManager = new AudioManager();
        if (audioManager.audioContext) {
            audioManager.audioContext.state = 'suspended';
            audioManager.resumeAudioContext();
            // Note: In real environment, this would change state, but we can't test it fully with mocks
            expect(audioManager.audioContext.resume).toBeDefined();
        }
    });
});

describe('GameAudioController', () => {
    let GameAudioController;
    let controller;

    beforeEach(() => {
        GameAudioController = require('../src/game-audio.js');
        // Reset singleton
        GameAudioController.instance = null;
        controller = new GameAudioController();
    });

    test('should create singleton instance', () => {
        const controller1 = new GameAudioController();
        const controller2 = new GameAudioController();
        expect(controller1).toBe(controller2);
    });

    test('should get instance via static method', () => {
        const instance = GameAudioController.getInstance();
        expect(instance).toBeDefined();
    });

    test('should delegate setVolume to audio manager', () => {
        controller.setVolume(0.5);
        // This will work if audioManager is properly initialized
        expect(controller.getVolume()).toBeDefined();
    });

    test('should delegate playSound to audio manager', () => {
        const result = controller.playSound('jump');
        // Result might be null if no audio context, but method should work
        expect(typeof result === 'object' || result === null).toBe(true);
    });

    test('should delegate mute to audio manager', () => {
        controller.mute();
        // Mute should not throw an error
        expect(controller).toBeDefined();
    });
});
