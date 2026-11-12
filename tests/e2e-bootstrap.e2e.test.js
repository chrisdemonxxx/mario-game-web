/**
 * End-to-End Integration Test
 * Tests the complete game bootstrap, rendering, and player input in a real browser
 */
import http from 'http';
import puppeteer from 'puppeteer';
import { describe, beforeAll, afterAll, beforeEach, afterEach, test, expect } from 'vitest';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Game Bootstrap and E2E Integration', () => {
    let server;
    let port;
    let browser;
    let page;
    let pageErrors = [];
    let handler;

    beforeAll(async () => {
        // Dynamically import server.js (which is CommonJS)
        const serverModule = await import(resolve(__dirname, '../server.js'));
        handler = serverModule.handler;

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
        pageErrors = [];
        page = await browser.newPage();

        // Listen for errors
        page.on('error', err => {
            pageErrors.push(`Page error: ${err.message}`);
            console.error('Page error:', err);
        });
        page.on('pageerror', err => {
            pageErrors.push(`Page error: ${err.message}`);
            console.error('Page error:', err);
        });
    });

    afterEach(async () => {
        if (pageErrors.length > 0) {
            console.log('Page errors encountered:', pageErrors);
        }
        if (page) {
            await page.close();
        }
    });

    test('should load the game page and initialize game state', async () => {
        await page.goto(`http://localhost:${port}`, { waitUntil: 'networkidle2' });

        // Check if the canvas element exists
        const canvas = await page.$('canvas');
        expect(canvas).not.toBeNull();

        // Wait a bit for game initialization
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 500)));

        // Check if game initialized
        const gameReady = await page.evaluate(() => {
            return window.gameInstance && window.gameInstance.gameRunning;
        });
        expect(gameReady).toBe(true);

        // Verify game state is 'playing'
        const gameState = await page.evaluate(() => window.gameInstance?.gameState);
        expect(gameState).toBe('playing');

        // Verify no page errors occurred
        expect(pageErrors).toHaveLength(0);
    });

    test('should respond to player input (arrow keys)', async () => {
        await page.goto(`http://localhost:${port}`, { waitUntil: 'networkidle2' });

        // Wait for game to initialize
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 500)));

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

        // Wait for game to initialize
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 500)));

        const canvasExists = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            const ctx = canvas.getContext('2d');
            return canvas !== null && ctx !== null;
        });
        expect(canvasExists).toBe(true);
    });

    test('should maintain game state during player movement', async () => {
        await page.goto(`http://localhost:${port}`, { waitUntil: 'networkidle2' });

        // Wait for game to initialize
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 500)));

        const initialState = await page.evaluate(() => window.gameInstance?.gameState);
        
        // Perform some player movement
        await page.keyboard.down('ArrowRight');
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 300)));
        await page.keyboard.up('ArrowRight');

        const stateAfterMovement = await page.evaluate(() => window.gameInstance?.gameState);
        
        // Game state should remain in playing state
        expect(stateAfterMovement).toBe(initialState);
        expect(stateAfterMovement).toBe('playing');
    });
});
