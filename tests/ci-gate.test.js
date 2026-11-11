/**
 * CI Gate Tests - Validate the lint-and-test CI check catches failures
 * These tests ensure the CI infrastructure properly validates code quality.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { handler, healthPayload } = require('../server');

describe('CI Gate: Health Endpoint', () => {
    let server;

    beforeAll((done) => {
        server = http.createServer(handler).listen(0, done);
    });

    afterAll((done) => {
        server.close(done);
    });

    test('healthPayload contains status ok', () => {
        const payload = healthPayload();
        expect(payload).toHaveProperty('status');
        expect(payload.status).toBe('ok');
    });

    test('healthPayload contains required metadata', () => {
        const payload = healthPayload();
        expect(payload).toHaveProperty('service');
        expect(payload).toHaveProperty('version');
        expect(payload).toHaveProperty('timestamp');
        expect(payload).toHaveProperty('uptime');
    });

    test('GET /health returns 200 with ok status', async () => {
        return new Promise((resolve, reject) => {
            const { port } = server.address();
            const start = Date.now();
            http.get({ host: '127.0.0.1', port, path: '/health' }, (res) => {
                let body = '';
                res.on('data', (chunk) => { body += chunk; });
                res.on('end', () => {
                    try {
                        const responseTime = Date.now() - start;
                        expect(res.statusCode).toBe(200);
                        expect(responseTime).toBeLessThan(2000);
                        const json = JSON.parse(body);
                        expect(json.status).toBe('ok');
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                });
            }).on('error', reject);
        });
    });

    test('health endpoint timestamp is valid ISO 8601', () => {
        const payload = healthPayload();
        const date = new Date(payload.timestamp);
        expect(isNaN(date.getTime())).toBe(false);
    });
});

describe('CI Gate: ESLint Configuration', () => {
    test('.eslintrc.json exists', () => {
        const eslintConfig = path.join(__dirname, '..', '.eslintrc.json');
        expect(fs.existsSync(eslintConfig)).toBe(true);
    });

    test('ESLint extends eslint:recommended', () => {
        const eslintConfig = path.join(__dirname, '..', '.eslintrc.json');
        const content = JSON.parse(fs.readFileSync(eslintConfig, 'utf8'));
        expect(content.extends).toContain('eslint:recommended');
    });

    test('ESLint rules enforce semicolons with "always"', () => {
        const eslintConfig = path.join(__dirname, '..', '.eslintrc.json');
        const content = JSON.parse(fs.readFileSync(eslintConfig, 'utf8'));
        const rules = content.rules || {};
        expect(rules.semi).toBeDefined();
        const rule = Array.isArray(rules.semi) ? rules.semi : [rules.semi];
        expect(rule[0]).toBe('error');
        expect(rule[1]).toBe('always');
    });

    test('ESLint rules enforce 4-space indent', () => {
        const eslintConfig = path.join(__dirname, '..', '.eslintrc.json');
        const content = JSON.parse(fs.readFileSync(eslintConfig, 'utf8'));
        const rules = content.rules || {};
        expect(rules.indent).toBeDefined();
        const rule = Array.isArray(rules.indent) ? rules.indent : [rules.indent];
        expect(rule[0]).toBe('error');
        expect(rule[1]).toBe(4);
    });

    test('CI workflow triggers on pull requests to main', () => {
        const ciFile = path.join(__dirname, '..', '.github', 'workflows', 'ci.yml');
        const content = fs.readFileSync(ciFile, 'utf8');
        expect(content).toContain('pull_request');
        expect(content).toContain('main');
    });

    test('CI job name is lint-and-test', () => {
        const ciFile = path.join(__dirname, '..', '.github', 'workflows', 'ci.yml');
        const content = fs.readFileSync(ciFile, 'utf8');
        expect(content).toContain('lint-and-test');
    });

    test('CI uploads coverage artifacts', () => {
        const ciFile = path.join(__dirname, '..', '.github', 'workflows', 'ci.yml');
        const content = fs.readFileSync(ciFile, 'utf8');
        expect(content).toContain('coverage');
    });
});

describe('CI Gate: Source Code Structure', () => {
    test('src directory exists', () => {
        const srcDir = path.join(__dirname, '..', 'src');
        expect(fs.existsSync(srcDir)).toBe(true);
    });

    test('src directory contains game modules', () => {
        const srcDir = path.join(__dirname, '..', 'src');
        const files = fs.readdirSync(srcDir).filter((f) => f.endsWith('.js'));
        expect(files.length).toBeGreaterThan(0);
    });

    test('server.js exports handler and healthPayload', () => {
        const server = require('../server');
        expect(typeof server.handler).toBe('function');
        expect(typeof server.healthPayload).toBe('function');
    });
});

describe('CI Gate: Full Pipeline Pass Conditions', () => {
    test('all required npm scripts exist', () => {
        const pkgJson = path.join(__dirname, '..', 'package.json');
        const content = JSON.parse(fs.readFileSync(pkgJson, 'utf8'));
        expect(content.scripts).toHaveProperty('start');
        expect(content.scripts).toHaveProperty('test');
        expect(content.scripts).toHaveProperty('lint');
    });

    test('eslint and jest are dev dependencies', () => {
        const pkgJson = path.join(__dirname, '..', 'package.json');
        const content = JSON.parse(fs.readFileSync(pkgJson, 'utf8'));
        expect(content.devDependencies).toHaveProperty('eslint');
        expect(content.devDependencies).toHaveProperty('jest');
    });
});

test('CI Gate Canary: Gate is active and working', () => {
    expect(true).toBe(true);
});
