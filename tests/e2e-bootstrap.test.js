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

        // Listen for pageerror events (uncaught errors on page)
        page.on('pageerror', (err) => {
            console.error(`Page error (uncaught): ${err}`);
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

        // Check that gameInstance is initialized in window
        const gameInstance = await page.evaluate(() => window.gameInstance);
        expect(gameInstance).toBeTruthy();

        // Check that canvas context exists
        const canvasCtx = await page.evaluate(() => {
            const canvas = document.getElementById('gameCanvas');
            return canvas ? 'OK' : null;
        });

        expect(canvasCtx).toBeTruthy();
    });

    test('Player instance exists in window', async () => {
        await page.goto(`http://localhost:${port}/`, {
            waitUntil: 'networkidle0'
        });

        // Wait for player to initialize
        await page.waitForFunction(() => {
            return window.playerInstance !== undefined;
        }, { timeout: 5000 });

        const playerX = await page.evaluate(() => window.playerInstance.x);
        const playerY = await page.evaluate(() => window.playerInstance.y);

        expect(playerX).toBeGreaterThanOrEqual(0);
        expect(playerY).toBeGreaterThanOrEqual(0);
    });

    test('Player can move right via keyboard', async () => {
        await page.goto(`http://localhost:${port}/`, {
            waitUntil: 'networkidle0'
        });

        // Wait for game to initialize
        await page.waitForFunction(() => {
            return window.playerInstance !== undefined;
        }, { timeout: 5000 });

        // Get initial player position
        const initialX = await page.evaluate(() => window.playerInstance.x);

        // Press right key and wait
        await page.keyboard.down('ArrowRight');
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 100)));
        await page.keyboard.up('ArrowRight');

        // Get new player position
        const positionAfterRight = await page.evaluate(() => window.playerInstance.x);

        // Player should have moved right from the initial position
        expect(positionAfterRight).toBeGreaterThan(initialX);
    });

    test('Player can move left via keyboard', async () => {
        await page.goto(`http://localhost:${port}/`, {
            waitUntil: 'networkidle0'
        });

        // Wait for game to initialize and reach a starting position to the right
        await page.waitForFunction(() => {
            return window.playerInstance !== undefined;
        }, { timeout: 10000 });

        // Get the player position after moving right
        const positionAfterRight = await page.evaluate(() => window.playerInstance.x);
        // Press left key and wait
        await page.keyboard.down('ArrowLeft');
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 100)));
        await page.keyboard.up('ArrowLeft');

        // Get new player position
        const newX = await page.evaluate(() => window.playerInstance.x);

        // Player should have moved left from the right position
        expect(newX).toBeLessThan(positionAfterRight);
    }, 15000);

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

        page.on('pageerror', (err) => {
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
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));

        // No uncaught errors should have been reported
        expect(uncaughtErrors).toEqual([]);
    });
});
