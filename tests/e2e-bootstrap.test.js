/* global puppeteer */
/**
 * @jest-environment node
 *
 * End-to-End Integration Test
 * Tests the complete game bootstrap, rendering, and player input in a real browser
 */
const http = require('http');
// eslint-disable-next-line no-unused-vars
// const puppeteer = require('puppeteer'); // Skipped in issue #56
const { handler } = require('../server');

describe.skip('Game Bootstrap and E2E Integration', () => {
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
        if (browser) {
            await browser.close();
        }
        if (server) {
            await new Promise(resolve => server.close(resolve));
        }
    });

    beforeEach(async () => {
        page = await browser.newPage();

        // Listen for errors
        page.on('error', err => {
            console.error('Page error:', err);
        });
        page.on('pageerror', err => {
            console.error('Page error:', err);
        });
    });

    afterEach(async () => {
        if (page) {
            await page.close();
        }
    });

    test('should load the game page and initialize game state', async () => {
        await page.goto(`http://localhost:${port}`, { waitUntil: 'networkidle2' });

        // Check if the canvas element exists
        const canvas = await page.$('canvas');
        expect(canvas).not.toBeNull();

        // Check if game initialized
        const gameReady = await page.evaluate(() => {
            return window.gameInstance && window.gameInstance.running;
        });
        expect(gameReady).toBe(true);
    });

    test('should respond to player input (arrow keys)', async () => {
        await page.goto(`http://localhost:${port}`, { waitUntil: 'networkidle2' });

        // Move player right first to establish a position
        await page.keyboard.down('ArrowRight');
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 200)));
        await page.keyboard.up('ArrowRight');

        // Get position after moving right
        const positionAfterRight = await page.evaluate(() => window.playerInstance.x);

        // Now move left
        await page.keyboard.down('ArrowLeft');
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 200)));
        await page.keyboard.up('ArrowLeft');

        // Get new player position after moving left
        const newX = await page.evaluate(() => window.playerInstance.x);

        // Player should have moved left from the right position
        expect(newX).toBeLessThan(positionAfterRight);
    });

    test('should render game elements on canvas', async () => {
        await page.goto(`http://localhost:${port}`, { waitUntil: 'networkidle2' });

        // Check if sprite data is available
        const hasSprites = await page.evaluate(() => {
            return window.spriteManager && window.spriteManager.sprites.length > 0;
        });
        expect(hasSprites).toBe(true);
    });

    test('should handle gravity and jumping', async () => {
        await page.goto(`http://localhost:${port}`, { waitUntil: 'networkidle2' });

        // Get initial position
        const initialY = await page.evaluate(() => window.playerInstance.y);

        // Press space to jump
        await page.keyboard.press('Space');
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 100)));

        // Position should change (jump or fall)
        const yAfterJump = await page.evaluate(() => window.playerInstance.y);

        // Player should have moved (either up or down depending on state)
        expect(yAfterJump).not.toBe(initialY);
    });
});