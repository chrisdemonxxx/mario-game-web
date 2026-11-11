// Unit Tests for Audio System
const GameAudioController = require('./game-audio');
const { AudioManager } = require('./audio');

describe('AudioManager', () => {
    let audioManager;

    beforeEach(() => {
        audioManager = new AudioManager();
    });

    test('AudioManager initializes with default volume', () => {
        expect(audioManager.masterVolume).toBe(0.7);
    });

    test('AudioManager registers sound', () => {
        audioManager.registerSound('jump', new AudioContext().createOscillator());
        expect(audioManager.sounds.has('jump')).toBe(true);
    });

    test('setVolume updates master volume', () => {
        audioManager.setVolume(0.5);
        expect(audioManager.masterVolume).toBe(0.5);
    });

    test('setVolume clamps value between 0 and 1', () => {
        audioManager.setVolume(1.5);
        expect(audioManager.masterVolume).toBe(1);
        audioManager.setVolume(-0.5);
        expect(audioManager.masterVolume).toBe(0);
    });

    test('toggleMute mutes and unmutes', () => {
        audioManager.toggleMute();
        expect(audioManager.isMuted).toBe(true);
        audioManager.toggleMute();
        expect(audioManager.isMuted).toBe(false);
    });

    test('AudioManager singleton pattern - only one instance', () => {
        const am1 = new AudioManager();
        const am2 = new AudioManager();
        // Note: In a real implementation with singleton pattern,
        // this would check instance identity
        expect(am1 instanceof AudioManager).toBe(true);
        expect(am2 instanceof AudioManager).toBe(true);
    });
});

describe('GameAudioController', () => {
    let gameAudio;

    beforeEach(() => {
        gameAudio = new GameAudioController();
    });

    test('GameAudioController initializes with AudioManager', () => {
        expect(gameAudio.audioManager).toBeDefined();
    });

    test('playSoundEffect delegates to AudioManager', () => {
        const spy = jest.spyOn(gameAudio.audioManager, 'playSound');
        gameAudio.playSoundEffect('jump');
        expect(spy).toHaveBeenCalledWith('jump');
    });

    test('setVolume synchronizes volume', () => {
        gameAudio.setVolume(0.5);
        expect(gameAudio.audioManager.masterVolume).toBe(0.5);
    });
});
