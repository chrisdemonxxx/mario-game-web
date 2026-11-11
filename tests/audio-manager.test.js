/* eslint-disable no-undef */
// Unit Tests for Audio System
const GameAudioController = require('../src/game-audio');
const AudioManager = require('../src/audio');

describe('AudioManager', () => {
    let audioManager;

    beforeEach(() => {
        audioManager = new AudioManager();
    });

    test('AudioManager initializes with default volume', () => {
        expect(audioManager.volume).toBe(0.7);
    });

    test('AudioManager muted property defaults to false', () => {
        expect(audioManager.muted).toBe(false);
    });

    test('setVolume updates volume', () => {
        audioManager.setVolume(0.5);
        expect(audioManager.volume).toBe(0.5);
    });

    test('setVolume clamps value between 0 and 1', () => {
        audioManager.setVolume(1.5);
        expect(audioManager.volume).toBe(1);
        audioManager.setVolume(-0.5);
        expect(audioManager.volume).toBe(0);
    });

    test('toggle mutes and unmutes', () => {
        audioManager.toggle();
        expect(audioManager.muted).toBe(true);
        audioManager.toggle();
        expect(audioManager.muted).toBe(false);
    });

    test('getVolume returns current volume', () => {
        audioManager.setVolume(0.3);
        expect(audioManager.getVolume()).toBe(0.3);
    });
});

describe('GameAudioController', () => {
    let gameAudio;

    beforeEach(() => {
        gameAudio = GameAudioController.getInstance();
    });

    test('GameAudioController is a singleton', () => {
        const gameAudio2 = GameAudioController.getInstance();
        expect(gameAudio).toBe(gameAudio2);
    });

    test('setVolume synchronizes volume', () => {
        gameAudio.setVolume(0.5);
        expect(gameAudio.audioManager.getVolume()).toBe(0.5);
    });

    test('mute toggles audio', () => {
        gameAudio.mute();
        expect(gameAudio.audioManager.muted).toBe(true);
    });
});
