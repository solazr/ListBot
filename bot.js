const fs = require('fs');
const { cs, ss } = require('./main');

let sv;
try { sv = JSON.parse(fs.readFileSync('servers.json')); }
catch (e) { console.error('Error reading servers.json:', e); process.exit(1); }

sv.forEach(s => cs(s));
