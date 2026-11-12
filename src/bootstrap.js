/**
 * Game Bootstrap - Initializes and runs the game
 * This file is loaded after all game modules to wire everything together
 */

// Global game instance
let gameInstance = null;
let playerInstance = null;
let levelManager = null;
let lastFrameTime = Date.now();
let animationId = null;

/**
 * Initialize the game
 */
async function initGame() {
    try {
        // Get canvas element
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            throw new Error('Canvas element with id "gameCanvas" not found');
        }

        // Load levels from JSON
        const levelsResponse = await fetch('assets/data/levels.json');
        if (!levelsResponse.ok) {
            throw new Error(`Failed to load levels: ${levelsResponse.status} ${levelsResponse.statusText}`);
        }
        const levelsData = await levelsResponse.json();
        const levels = levelsData.levels;

        // Initialize game, player, and level manager
        gameInstance = new Game(canvas);
        playerInstance = new Player(50, 300, null);

        // Create Level instances for level manager
        levelManager = new LevelManager(levels);

        // Set up keyboard input handlers
        setupKeyboardInput();

        // Start the game
        gameInstance.start();

        // Start the rendering loop
        startRenderingLoop();

        console.log('Game initialized successfully');
    } catch (error) {
        console.error('Failed to initialize game:', error);
        // Display error on canvas
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#FF0000';
            ctx.font = '16px Arial';
            ctx.fillText('Error: ' + error.message, 10, 50);
        }
    }
}

/**
 * Set up keyboard input handlers
 */
function setupKeyboardInput() {
    const keysPressed = {};

    document.addEventListener('keydown', (e) => {
        keysPressed[e.key.toLowerCase()] = true;

        // Handle specific keys
        if (e.key.toLowerCase() === 'arrowleft' || e.key.toLowerCase() === 'a') {
            playerInstance.setInput('left', true);
            playerInstance.moveLeft();
        } else if (e.key.toLowerCase() === 'arrowright' || e.key.toLowerCase() === 'd') {
            playerInstance.setInput('right', true);
            playerInstance.moveRight();
        } else if (e.key.toLowerCase() === ' ' || e.key.toLowerCase() === 'arrowup' || e.key.toLowerCase() === 'w') {
            e.preventDefault();
            playerInstance.jump();
        }
    });

    document.addEventListener('keyup', (e) => {
        keysPressed[e.key.toLowerCase()] = false;

        // Handle specific keys
        if (e.key.toLowerCase() === 'arrowleft' || e.key.toLowerCase() === 'a') {
            playerInstance.setInput('left', false);
            playerInstance.velocityX = 0;
        } else if (e.key.toLowerCase() === 'arrowright' || e.key.toLowerCase() === 'd') {
            playerInstance.setInput('right', false);
            playerInstance.velocityX = 0;
        }
    });
}

/**
 * Start the rendering loop
 */
function startRenderingLoop() {
    function render() {
        const now = Date.now();
        const deltaTime = (now - lastFrameTime) / 1000; // Convert to seconds
        lastFrameTime = now;

        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');

        // Clear canvas
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Update game state
        if (gameInstance.gameRunning) {
            gameInstance.updateGameTime(deltaTime * 1000); // Convert back to ms
            playerInstance.update(deltaTime);

            // Simple gravity simulation if physics module isn't directly integrated
            if (playerInstance.y + playerInstance.height < canvas.height - 100) {
                playerInstance.velocityY += 600 * deltaTime; // Apply gravity
            } else {
                // Player is on ground
                playerInstance.setGrounded(true);
                playerInstance.y = canvas.height - 100 - playerInstance.height;
                playerInstance.velocityY = 0;
            }

            // Apply velocity
            playerInstance.x += playerInstance.velocityX;
            playerInstance.y += playerInstance.velocityY;

            // Boundary checks
            if (playerInstance.x < 0) playerInstance.x = 0;
            if (playerInstance.x + playerInstance.width > canvas.width) {
                playerInstance.x = canvas.width - playerInstance.width;
            }
            if (playerInstance.y > canvas.height) {
                // Player fell off screen - game over
                gameInstance.endGame('Fell off the map');
            }
        }

        // Render player
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(playerInstance.x, playerInstance.y, playerInstance.width, playerInstance.height);

        // Render simple ground
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

        // Render HUD
        gameInstance.renderHUD();

        // Continue animation loop
        animationId = requestAnimationFrame(render);
    }

    render();
}

/**
 * Stop the rendering loop
 */
function stopRenderingLoop() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
}

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initGame, stopRenderingLoop, getGameInstance: () => gameInstance };
}
