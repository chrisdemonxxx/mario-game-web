/**
 * Sprite Asset Generator - Creates pixel art sprites for the game
 * Generates simple 8-bit style sprites for player, enemies, coins, and tiles
 */

const SpriteAssets = {
    /**
   * Player sprite patterns for different animation states
   */
    player: {
        idle: [
            [0, 0, 0, 0, 0, 0],
            [0, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 0],
            [0, 2, 2, 2, 2, 0],
            [0, 2, 2, 2, 2, 0],
        ],
        run_frame_0: [
            [0, 0, 0, 0, 0, 0],
            [0, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 0],
            [0, 2, 2, 1, 2, 0],
            [0, 2, 2, 2, 2, 0],
            [0, 0, 2, 0, 0, 0],
        ],
        run_frame_1: [
            [0, 0, 0, 0, 0, 0],
            [0, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 0],
            [0, 2, 1, 2, 2, 0],
            [0, 2, 2, 2, 2, 0],
            [0, 0, 0, 2, 0, 0],
        ],
        jump: [
            [0, 2, 0, 0, 0, 0],
            [0, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 0],
            [0, 2, 2, 2, 2, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
        ],
        fall: [
            [0, 0, 0, 0, 0, 2],
            [0, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 0],
            [0, 2, 2, 2, 2, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
        ],
    },

    /**
   * Enemy sprite patterns (Goomba-like)
   */
    enemy: {
        walk_frame_0: [
            [0, 0, 0, 0, 0, 0],
            [0, 3, 3, 3, 3, 0],
            [0, 3, 3, 3, 3, 0],
            [0, 4, 4, 4, 4, 0],
            [0, 4, 0, 4, 0, 0],
            [0, 0, 4, 0, 0, 0],
        ],
        walk_frame_1: [
            [0, 0, 0, 0, 0, 0],
            [0, 3, 3, 3, 3, 0],
            [0, 3, 3, 3, 3, 0],
            [0, 4, 4, 4, 4, 0],
            [0, 4, 0, 0, 4, 0],
            [0, 0, 0, 4, 0, 0],
        ],
        crushed: [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 3, 3, 3, 3, 0],
            [0, 3, 3, 3, 3, 0],
            [0, 4, 4, 4, 4, 0],
            [0, 0, 0, 0, 0, 0],
        ],
    },

    /**
   * Collectible coin sprite
   */
    coin: {
        spin_frame_0: [
            [0, 0, 1, 0, 0],
            [0, 1, 1, 1, 0],
            [0, 1, 2, 1, 0],
            [0, 1, 1, 1, 0],
            [0, 0, 1, 0, 0],
        ],
        spin_frame_1: [
            [0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0],
            [1, 1, 2, 1, 1],
            [0, 0, 1, 0, 0],
            [0, 0, 0, 0, 0],
        ],
        spin_frame_2: [
            [0, 0, 1, 0, 0],
            [0, 1, 1, 1, 0],
            [0, 1, 2, 1, 0],
            [0, 1, 1, 1, 0],
            [0, 0, 1, 0, 0],
        ],
    },

    /**
   * Tileset sprites
   */
    tiles: {
        grass: [
            [1, 1, 1, 1],
            [1, 1, 1, 1],
            [2, 2, 2, 2],
            [2, 2, 2, 2],
        ],
        stone: [
            [3, 3, 3, 3],
            [3, 4, 4, 3],
            [3, 4, 4, 3],
            [3, 3, 3, 3],
        ],
        spike: [
            [0, 5, 0, 0],
            [5, 5, 5, 0],
            [0, 5, 0, 0],
            [0, 0, 0, 0],
        ],
    },

    /**
   * Goal/Flag sprite
   */
    goal: {
        flag: [
            [6, 0, 0, 0],
            [6, 6, 6, 0],
            [6, 0, 6, 0],
            [6, 0, 0, 0],
            [3, 3, 3, 3],
        ],
    },

    /**
   * UI sprites
   */
    ui: {
        heart: [
            [0, 1, 1, 0, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1],
            [0, 1, 1, 1, 1, 1, 0],
            [0, 0, 1, 1, 1, 0, 0],
            [0, 0, 0, 1, 0, 0, 0],
        ],
    },

    /**
   * Get color palette (hex colors)
   * Used consistently across all sprites
   */
    getColorPalette() {
        return [
            '#FF0000', // 1: Red (player, coin core)
            '#0000FF', // 2: Blue (player legs, coin outer)
            '#8B4513', // 3: Brown (enemy, goal pole)
            '#FFD700', // 4: Gold (enemy spots, tile detail)
            '#FF6B35', // 5: Orange (spike)
            '#FF1493', // 6: Red (goal flag)
        ];
    },

    /**
   * Get all sprite patterns organized by type
   */
    getAll() {
        return {
            player: this.player,
            enemy: this.enemy,
            coin: this.coin,
            tiles: this.tiles,
            goal: this.goal,
            ui: this.ui,
        };
    },
};

// Export for use in sprite manager
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SpriteAssets };
}
