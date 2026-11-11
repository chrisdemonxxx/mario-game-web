/**
 * @jest-environment node
 */
const http = require('http');
const { handler, healthPayload } = require('../server');

function request(server, pathname) {
    return new Promise((resolve, reject) => {
        const { port } = server.address();
        http.get({ host: '127.0.0.1', port, path: pathname }, (res) => {
            let body = '';
            res.on('data', (chunk) => { body += chunk; });
            res.on('end', () => resolve({ status: res.statusCode, body, headers: res.headers }));
        }).on('error', reject);
    });
}

describe('server', () => {
    let server;
    beforeAll((done) => {
        server = http.createServer(handler).listen(0, done);
    });
    afterAll((done) => { server.close(done); });

    test('healthPayload reports ok', () => {
        expect(healthPayload().status).toBe('ok');
    });

    test('GET /health returns 200 JSON', async () => {
        const res = await request(server, '/health');
        expect(res.status).toBe(200);
        expect(JSON.parse(res.body).status).toBe('ok');
    });

    test('GET / serves index.html', async () => {
        const res = await request(server, '/');
        expect(res.status).toBe(200);
        expect(res.body).toContain('gameCanvas');
    });

    test('GET missing file returns 404', async () => {
        const res = await request(server, '/nope.js');
        expect(res.status).toBe(404);
    });
});
