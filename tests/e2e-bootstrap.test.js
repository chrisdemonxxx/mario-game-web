/**
 * @jest-environment node
 *
 * End-to-End Integration Test
 * Tests the complete game bootstrap, rendering, and player input in a real browser
 */
const http = require('http');
const puppeteer = require('puppeteer');
const { handler } = require('../server');

describe('Game Bootstrap and E2E Integration', () => {
    let server;
    let port;
    let browser;
    let page;

    beforeAll(async () => {
        // Start the server on a random available port
        server = http.createServer(handler);
        await new Promise((resolve) => {
            server.listen(0, resolve);
        });
        port = server.address().port;
        console.log(`Test server listening on port ${port}`);

        // Launch browser
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    });

    afterAll(async () => {
        // Close browser
        if (browser) {
            await browser.close();
        }
        // Close server
        if (server) {
            await new Promise((resolve) => {
                server.close(resolve);
            });
        }
    });

    beforeEach(async () => {
        // Create a new page for each test
        page = await browser.newPage();

        // Collect console messages and errors
        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                console.error(`Browser console error: ${msg.text()}`);
            }
        });

        // Collect page errors
        page.on('error', (err) => {
            console.error(`Page error: ${err}`);
        });
    });

    afterEach(async () => {
        // Close page
        if (page) {
            await page.close();
        }
    });

    test('Game page loads without errors', async () => {
        const response = await page.goto(`http://localhost:${port}/`, {
            waitUntil: 'networkidle0'
        });

        expect(response.status()).toBe(200);

        // Check that canvas element exists
        const canvas = await page.$('#gameCanvas');
        expect(canvas).toBeTruthy();
    });

    test('Game initializes and bootstrap completes', async () => {
        await page.goto(`http://localhost:${port}/`, {
            waitUntil: 'networkidle0'
        });

        // Wait for game initialization (game should log a message)
        const initMessage = await page.waitForFunction(() => {
            return window.gameInstance !== undefined;
        }, { timeout: 5000 });

        expect(initMessage).toBeTruthy();

        // Verify game instance has expected properties
        const gameState = await page.evaluate(() => {
            if (!window.gameInstance) return null;
            return {
                gameState: window.gameInstance.gameState,
                gameRunning: window.gameInstance.gameRunning,
                currentLevel: window.gameInstance.currentLevel,
                score: window.gameInstance.score
            };
        });

        expect(gameState).toEqual({
            gameState: 'playing',
            gameRunning: true,
            currentLevel: 1,
            score: 0
        });
    });

    test('Player exists and is rendered on canvas', async () => {
        await page.goto(`http://localhost:${port}/`, {
            waitUntil: 'networkidle0'
        });

        // Wait for game to initialize
        await page.waitForFunction(() => {
            return window.playerInstance !== undefined;
        }, { timeout: 5000 });

        // Get player properties
        const playerState = await page.evaluate(() => {
            if (!window.playerInstance) return null;
            return {
                x: window.playerInstance.x,
                y: window.playerInstance.y,
                width: window.playerInstance.width,
                height: window.playerInstance.height
            };
        });

        // Verify player has valid position and size
        expect(playerState).toBeTruthy();
        expect(playerState.x).toBeGreaterThanOrEqual(0);
        expect(playerState.y).toBeGreaterThanOrEqual(0);
        expect(playerState.width).toBeGreaterThan(0);
        expect(playerState.height).toBeGreaterThan(0);
    });

    test('Keyboard input moves player to the right', async () => {
        await page.goto(`http://localhost:${port}/`, {
            waitUntil: 'networkidle0'
        });

        // Wait for game to initialize
        await page.waitForFunction(() => {
            return window.playerInstance !== undefined;
        }, { timeout: 5000 });

        // Get initial player position
        const initialX = await page.evaluate(() => window.playerInstance.x);

        // Simulate arrow right key press
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('ArrowRight');

        // Wait a bit for the player to move
        await page.waitForTimeout(100);

        // Get new player position
        const newX = await page.evaluate(() => window.playerInstance.x);

        // Player should have moved right
        expect(newX).toBeGreaterThan(initialX);
    });

    test('Keyboard input moves player to the left', async () => {
        await page.goto(`http://localhost:${port}/`, {
            waitUntil: 'networkidle0'
        });

        // Wait for game to initialize
        await page.waitForFunction(() => {
            return window.playerInstance !== undefined;
        }, { timeout: 5000 });

        // Move player to the right first
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(100);

        const positionAfterRight = await page.evaluate(() => window.playerInstance.x);

        // Now move left
        await page.keyboard.press('ArrowLeft');
        await page.keyboard.press('ArrowLeft');
        await page.waitForTimeout(100);

        // Get new player position
        const newX = await page.evaluate(() => window.playerInstance.x);

        // Player should have moved left from the right position
        expect(newX).toBeLessThan(positionAfterRight);
    });

    test('Required resources load without 404 errors', async () => {
        const failedRequests = [];

        page.on('response', (response) => {
            if (response.status() >= 400) {
                failedRequests.push({
                    url: response.url(),
                    status: response.status()
                });
            }
        });

        await page.goto(`http://localhost:${port}/`, {
            waitUntil: 'networkidle0'
        });

        // Wait for all game modules to load
        await page.waitForFunction(() => {
            return window.gameInstance !== undefined;
        }, { timeout: 5000 });

        // Filter out expected failures (like favicon which may 404)
        const criticalFailures = failedRequests.filter(r => {
            return !r.url.includes('favicon') && !r.url.includes('.mp3') && !r.url.includes('.wav');
        });

        expect(criticalFailures).toEqual([]);
    });

    test('No uncaught errors during game execution', async () => {
        const uncaughtErrors = [];

        page.on('error', (err) => {
            uncaughtErrors.push(err.toString());
        });

        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                uncaughtErrors.push(msg.text());
            }
        });

        await page.goto(`http://localhost:${port}/`, {
            waitUntil: 'networkidle0'
        });

        // Wait for game to initialize and run for a bit
        await page.waitForFunction(() => {
            return window.gameInstance !== undefined;
        }, { timeout: 5000 });

        // Let the game run for a moment
        await page.waitForTimeout(1000);

        // No uncaught errors should have been reported
        expect(uncaughtErrors).toEqual([]);
    });
});
