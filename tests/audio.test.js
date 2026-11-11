/* eslint-disable no-undef */
// Audio system integration tests
const AudioManager = require('../src/audio');
const GameAudioController = require('../src/game-audio');

describe('Audio System Integration', () => {
    test('AudioManager can be instantiated', () => {
        const audio = new AudioManager();
        expect(audio).toBeDefined();
        expect(audio.volume).toBe(0.7);
    });

    test('GameAudioController integrates with AudioManager', () => {
        const controller = GameAudioController.getInstance();
        expect(controller).toBeDefined();
        expect(controller.audioManager).toBeDefined();
    });
});
