/**
 * Game Audio Integration - Connects game events to audio playback
 */
class GameAudioSystem {
    constructor(game, audioManager) {
        this.game = game;
        this.audioManager = audioManager;
        this.soundsPreloaded = false;
        this.currentLevelMusic = null;
    }
    
    /**
     * Preload all game sounds and music
     */
    async preloadAudio() {
        if (this.soundsPreloaded) return;
        
        console.log('GameAudioSystem: Preloading audio assets...');
        
        // Preload sound effects
        const soundEffects = {
            'coin-pickup': 'assets/audio/sfx/coin-pickup.mp3',
            'jump': 'assets/audio/sfx/jump.mp3',
            'enemy-hit': 'assets/audio/sfx/enemy-hit.mp3',
            'enemy-death': 'assets/audio/sfx/enemy-death.mp3',
            'player-damage': 'assets/audio/sfx/player-damage.mp3',
            'level-complete': 'assets/audio/sfx/level-complete.mp3',
            'game-over': 'assets/audio/sfx/game-over.mp3'
        };
        
        for (const [name, url] of Object.entries(soundEffects)) {
            await this.audioManager.loadSoundEffect(name, url).catch(() => {
                console.warn(`Failed to load sound: ${name}`);
            });
        }
        
        // Preload music
        const musicTracks = {
            'menu': 'assets/audio/music/menu.mp3',
            'level-1': 'assets/audio/music/level-1.mp3',
            'level-2': 'assets/audio/music/level-2.mp3',
            'level-3': 'assets/audio/music/level-3.mp3'
        };
        
        for (const [name, url] of Object.entries(musicTracks)) {
            await this.audioManager.loadMusic(name, url).catch(() => {
                console.warn(`Failed to load music: ${name}`);
            });
        }
        
        this.soundsPreloaded = true;
        console.log('GameAudioSystem: Audio preload complete');
    }
    
    /**
     * Play coin pickup sound
     */
    onCoinPickup() {
        this.audioManager.playSound('coin-pickup', 0.8);
    }
    
    /**
     * Play jump sound
     */
    onPlayerJump() {
        this.audioManager.playSound('jump', 0.6);
    }
    
    /**
     * Play enemy hit sound
     */
    onEnemyHit() {
        this.audioManager.playSound('enemy-hit', 0.7);
    }
    
    /**
     * Play enemy death sound
     */
    onEnemyDeath() {
        this.audioManager.playSound('enemy-death', 0.8);
    }
    
    /**
     * Play player damage sound
     */
    onPlayerDamage() {
        this.audioManager.playSound('player-damage', 0.7);
    }
    
    /**
     * Play level complete sound
     */
    onLevelComplete() {
        this.audioManager.playSound('level-complete', 1.0);
    }
    
    /**
     * Play game over sound
     */
    onGameOver() {
        this.audioManager.playSound('game-over', 0.9);
    }
    
    /**
     * Play music for current level
     */
    playLevelMusic(levelIndex) {
        const musicMap = {
            0: 'level-1',
            1: 'level-2',
            2: 'level-3'
        };
        
        const musicName = musicMap[levelIndex] || 'level-1';
        this.currentLevelMusic = musicName;
        this.audioManager.playMusic(musicName, 0.5);
    }
    
    /**
     * Stop level music
     */
    stopLevelMusic() {
        this.audioManager.stopMusic(0.3);
        this.currentLevelMusic = null;
    }
    
    /**
     * Set master volume
     */
    setVolume(percentage) {
        this.audioManager.setVolume(percentage);
    }
    
    /**
     * Toggle mute
     */
    toggleMute() {
        return this.audioManager.toggleMute();
    }
}
