const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '.')));

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.ico': 'image/x-icon',
};

function healthPayload() {
    return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    };
}

app.get('/health', (req, res) => {
    res.json(healthPayload());
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Health check at http://localhost:${PORT}/health`);
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { app, mimeTypes, healthPayload };
}
