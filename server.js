/**
 * Minimal static file server with a /health endpoint.
 * Zero dependencies so Railway can run `npm start` without extra packages.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const ROOT = __dirname;
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg": 'audio/ogg',
    '.ico': 'image/x-icon',
};

function healthPayload() {
    return {
        status: 'ok',
        service: 'mario-game-web',
        version: require('./package.json').version,
        uptime: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
    };
}

function handler(req, res) {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/health' || url.pathname === '/healthz') {
        res.writeHead(200, { 'Content-Type': MIME['.json'], 'Cache-Control': 'no-store' });
        res.end(JSON.stringify(healthPayload()));
        return;
    }
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/') {
        pathname = '/index.html';
    }
    const filePath = path.normalize(path.join(ROOT, pathname));
    if (!filePath.startsWith(ROOT) || filePath.includes(`${path.sep}node_modules${path.sep}`)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not found');
            return;
        }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
        res.end(data);
    });
}

if (require.main === module) {
    http.createServer(handler).listen(PORT, () => {
        console.log(`mario-game-web listening on port ${PORT}`);
    });
}

module.exports = { handler, healthPayload };
