class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.score = 0;
        this.gameRunning = true;
        this.frameCount = 0;
        this.lastFrameTime = Date.now();
        this.deltaTime = 0;
        this.fps = 60;
        this.frameTime = 1000 / this.fps; // ~16.67ms per frame at 60 FPS
    }

    init() {
        // Initialize game state
        if (!this.ctx) {
            console.error('Failed to get 2D context from canvas');
            this.gameRunning = false;
            return;
        }
        // Set initial game properties
        this.score = 0;
        this.frameCount = 0;
        console.log('Game initialized with canvas:', this.canvas);
    }

    update() {
        // Update game logic each frame
        // This is where physics, collisions, AI, and input are processed
        this.frameCount++;
        // Calculate delta time for frame-independent movement
        const now = Date.now();
        this.deltaTime = Math.min((now - this.lastFrameTime) / 1000, 0.1); // Cap delta time
        this.lastFrameTime = now;
    }

    render() {
        // Render game state to canvas
        if (!this.ctx) return;

        // Clear canvas
        this.ctx.fillStyle = '#87CEEB'; // Sky blue
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw ground
        this.ctx.fillStyle = '#228B22'; // Forest green
        this.ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);

        // Draw basic text debug info
        this.ctx.fillStyle = '#000000';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Frame: ${this.frameCount}`, 10, 20);
        this.ctx.fillText(`Score: ${this.score}`, 10, 40);
        this.ctx.fillText(`Delta: ${this.deltaTime.toFixed(3)}s`, 10, 60);
    }

    start() {
        // Initialize and start the game loop
        this.init();
        console.log('Game started');
        this.gameLoop();
    }

    gameLoop() {
        // Main game loop using requestAnimationFrame for 60 FPS
        if (!this.gameRunning) {
            return; // Stop loop if game is not running
        }

        // Update game state
        this.update();

        // Render current state
        this.render();

        // Schedule next frame
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Export for Jest (CommonJS) while staying usable as a plain <script> in the browser.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Game };
}
