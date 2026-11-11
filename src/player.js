const fs = require('fs');
const playerContent = fs.readFileSync('/tmp/player_updated.js', 'utf-8');
process.stdout.write(playerContent);