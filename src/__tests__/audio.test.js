// Audio system tests
const AudioManager = require('./audio');
const GameAudioController = require('./game-audio');

function testAudioManagerInit() {
    const audioManager = new AudioManager();
    console.assert(audioManager !== null, 'AudioManager initialization failed');
    console.assert(audioManager.volume !== undefined, 'Volume property not initialized');
    console.assert(audioManager.muted !== undefined, 'Muted property not initialized');
}

function testVolumeControl() {
    const audioManager = new AudioManager();
    audioManager.setVolume(0.5);
    console.assert(audioManager.volume === 0.5, 'Volume setter failed');
}

function testMuteToggle() {
    const audioManager = new AudioManager();
    audioManager.toggle();
    console.assert(audioManager.muted === true, 'Mute toggle failed');
    audioManager.toggle();
    console.assert(audioManager.muted === false, 'Unmute toggle failed');
}

function testGameAudioController() {
    const controller = GameAudioController.getInstance();
    console.assert(controller !== null, 'GameAudioController initialization failed');
    console.assert(typeof controller.playSound === 'function', 'playSound method not found');
}

function testSingletonPattern() {
    const controller1 = GameAudioController.getInstance();
    const controller2 = GameAudioController.getInstance();
    console.assert(controller1 === controller2, 'Singleton pattern failed');
}

function testVolumeSynchronization() {
    const controller = GameAudioController.getInstance();
    controller.setVolume(0.8);
    console.assert(controller.getVolume() === 0.8, 'Volume synchronization failed');
}

// Run tests
function runAudioTests() {
    console.log('\n=== AUDIO SYSTEM TESTS ===\n');
  
    const tests = [
        { name: 'AudioManager Initialization', fn: testAudioManagerInit },
        { name: 'Volume Control', fn: testVolumeControl },
        { name: 'Mute Toggle', fn: testMuteToggle },
        { name: 'GameAudioController Init', fn: testGameAudioController },
        { name: 'Singleton Pattern', fn: testSingletonPattern },
        { name: 'Volume Synchronization', fn: testVolumeSynchronization },
    ];
  
    let passed = 0, failed = 0;
  
    tests.forEach(test => {
        try {
            test.fn();
            console.log(`✓ ${test.name}`);
            passed++;
        } catch (e) {
            console.error(`✗ ${test.name}: ${e.message}`);
            failed++;
        }
    });
  
    console.log(`\nPassed: ${passed}/${tests.length}`);
    console.log(`Failed: ${failed}/${tests.length}\n`);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runAudioTests };
}

if (typeof require !== 'undefined' && require.main === module) {
    runAudioTests();
}
