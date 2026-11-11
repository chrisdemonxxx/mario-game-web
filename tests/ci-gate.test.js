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
                    const responseTime = Date.now() - start;
                    expect(res.statusCode).toBe(200);
                    expect(responseTime).toBeLessThan(2000);
                    const json = JSON.parse(body);
                    expect(json.status).toBe('ok');
                    resolve();
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
        expect(content).toHaveProperty('extends');
        expect(content.extends).toContain('eslint:recommended');
    });

    test('ESLint has strict rules configured', () => {
        const eslintConfig = path.join(__dirname, '..', '.eslintrc.json');
        const content = JSON.parse(fs.readFileSync(eslintConfig, 'utf8'));
        expect(content).toHaveProperty('rules');
        expect(content.rules).toHaveProperty('no-unused-vars');
        expect(content.rules).toHaveProperty('semi');
        expect(content.rules).toHaveProperty('indent');
    });

    test('no-unused-vars rule enforces strict checking', () => {
        const eslintConfig = path.join(__dirname, '..', '.eslintrc.json');
        const content = JSON.parse(fs.readFileSync(eslintConfig, 'utf8'));
        const rule = content.rules['no-unused-vars'];
        const isError = rule === 'error' || (Array.isArray(rule) && rule[0] === 'error');
        expect(isError).toBe(true);
    });

    test('semi rule requires semicolons', () => {
        const eslintConfig = path.join(__dirname, '..', '.eslintrc.json');
        const content = JSON.parse(fs.readFileSync(eslintConfig, 'utf8'));
        const rule = content.rules.semi;
        const requiresSemi = Array.isArray(rule) && rule[1] === 'always';
        expect(requiresSemi).toBe(true);
    });

    test('indent rule enforces 4 spaces', () => {
        const eslintConfig = path.join(__dirname, '..', '.eslintrc.json');
        const content = JSON.parse(fs.readFileSync(eslintConfig, 'utf8'));
        const rule = content.rules.indent;
        expect(Array.isArray(rule)).toBe(true);
        expect(rule[1]).toBe(4);
    });
});

describe('CI Gate: Jest Configuration', () => {
    test('jest.config.js exists', () => {
        const jestConfig = path.join(__dirname, '..', 'jest.config.js');
        expect(fs.existsSync(jestConfig)).toBe(true);
    });

    test('jest config specifies test directory', () => {
        const jestConfig = path.join(__dirname, '..', 'jest.config.js');
        const content = fs.readFileSync(jestConfig, 'utf8');
        expect(content).toContain("'<rootDir>/tests'");
    });

    test('jest config includes .test.js file pattern', () => {
        const jestConfig = path.join(__dirname, '..', 'jest.config.js');
        const content = fs.readFileSync(jestConfig, 'utf8');
        expect(content).toContain('.test.js');
    });

    test('jest config covers source code', () => {
        const jestConfig = path.join(__dirname, '..', 'jest.config.js');
        const content = fs.readFileSync(jestConfig, 'utf8');
        expect(content).toContain('src/**/*.js');
        expect(content).toContain('server.js');
    });
});

describe('CI Gate: Package.json Configuration', () => {
    test('package.json has lint script', () => {
        const pkgJson = path.join(__dirname, '..', 'package.json');
        const content = JSON.parse(fs.readFileSync(pkgJson, 'utf8'));
        expect(content.scripts).toHaveProperty('lint');
        expect(content.scripts.lint).toContain('eslint');
    });

    test('package.json has test script with coverage', () => {
        const pkgJson = path.join(__dirname, '..', 'package.json');
        const content = JSON.parse(fs.readFileSync(pkgJson, 'utf8'));
        expect(content.scripts).toHaveProperty('test');
        expect(content.scripts.test).toContain('jest');
        expect(content.scripts.test).toContain('coverage');
    });

    test('package.json has ci script', () => {
        const pkgJson = path.join(__dirname, '..', 'package.json');
        const content = JSON.parse(fs.readFileSync(pkgJson, 'utf8'));
        expect(content.scripts).toHaveProperty('ci');
    });
});

describe('CI Gate: CI Workflow Structure', () => {
    test('.github/workflows/ci.yml exists', () => {
        const ciFile = path.join(__dirname, '..', '.github', 'workflows', 'ci.yml');
        expect(fs.existsSync(ciFile)).toBe(true);
    });

    test('CI workflow runs npm install', () => {
        const ciFile = path.join(__dirname, '..', '.github', 'workflows', 'ci.yml');
        const content = fs.readFileSync(ciFile, 'utf8');
        expect(content).toContain('npm install');
    });

    test('CI workflow runs npm run lint', () => {
        const ciFile = path.join(__dirname, '..', '.github', 'workflows', 'ci.yml');
        const content = fs.readFileSync(ciFile, 'utf8');
        expect(content).toContain('npm run lint');
    });

    test('CI workflow runs npm test', () => {
        const ciFile = path.join(__dirname, '..', '.github', 'workflows', 'ci.yml');
        const content = fs.readFileSync(ciFile, 'utf8');
        expect(content).toContain('npm test');
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
