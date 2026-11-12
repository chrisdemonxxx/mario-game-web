/**
 * Game Bootstrap - Initializes and runs the game
 * This file is loaded after all game modules to wire everything together
 * All game modules are loaded via <script> tags in index.html, so they're available globally
 */

// Global game instances (assigned to window for testing and external access)
window.gameInstance = null;
window.playerInstance = null;
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

        // Initialize game and player
        // eslint-disable-next-line no-undef
        window.gameInstance = new Game(canvas);
        // eslint-disable-next-line no-undef
        window.playerInstance = new Player(50, 300, null);

        // Set up keyboard input handlers
        setupKeyboardInput();

        // Start the game
        window.gameInstance.start();

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
            window.playerInstance.setInput('left', true);
            window.playerInstance.moveLeft();
        } else if (e.key.toLowerCase() === 'arrowright' || e.key.toLowerCase() === 'd') {
            window.playerInstance.setInput('right', true);
            window.playerInstance.moveRight();
        } else if (e.key.toLowerCase() === ' ' || e.key.toLowerCase() === 'arrowup' || e.key.toLowerCase() === 'w') {
            e.preventDefault();
            window.playerInstance.jump();
        }
    });

    document.addEventListener('keyup', (e) => {
        keysPressed[e.key.toLowerCase()] = false;

        // Handle specific keys
        if (e.key.toLowerCase() === 'arrowleft' || e.key.toLowerCase() === 'a') {
            window.playerInstance.setInput('left', false);
            window.playerInstance.velocityX = 0;
        } else if (e.key.toLowerCase() === 'arrowright' || e.key.toLowerCase() === 'd') {
            window.playerInstance.setInput('right', false);
            window.playerInstance.velocityX = 0;
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
        if (window.gameInstance.gameRunning) {
            window.gameInstance.updateGameTime(deltaTime * 1000); // Convert back to ms
            window.playerInstance.update(deltaTime);

            // Simple gravity simulation if physics module isn't directly integrated
            if (window.playerInstance.y + window.playerInstance.height < canvas.height - 100) {
                window.playerInstance.velocityY += 600 * deltaTime; // Apply gravity
            } else {
                // Player is on ground
                window.playerInstance.setGrounded(true);
                window.playerInstance.y = canvas.height - 100 - window.playerInstance.height;
                window.playerInstance.velocityY = 0;
            }

            // Apply velocity
            window.playerInstance.x += window.playerInstance.velocityX;
            window.playerInstance.y += window.playerInstance.velocityY;

            // Boundary checks
            if (window.playerInstance.x < 0) window.playerInstance.x = 0;
            if (window.playerInstance.x + window.playerInstance.width > canvas.width) {
                window.playerInstance.x = canvas.width - window.playerInstance.width;
            }
            if (window.playerInstance.y > canvas.height) {
                // Player fell off screen - game over
                window.gameInstance.endGame('Fell off the map');
            }
        }

        // Render player
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(window.playerInstance.x, window.playerInstance.y, window.playerInstance.width, window.playerInstance.height);

        // Render simple ground
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

        // Render HUD
        window.gameInstance.renderHUD();

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
    module.exports = { initGame, stopRenderingLoop, getGameInstance: () => window.gameInstance };
}
