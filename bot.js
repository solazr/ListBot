const fs = require('fs');
const { chkServer, serverStatus } = require('./serverStuff');

let servers;
try {
    servers = JSON.parse(fs.readFileSync('servers.json'));
} catch (err) {
    console.error('Error reading servers.json:', err);
    process.exit(1);
}

servers.forEach(server => {
    chkServer(server);
});
