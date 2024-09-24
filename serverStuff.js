const mineflayer = require('mineflayer');
const { randUsername } = require('./randUser');
const fs = require('fs');

const deathThreshold = 5;
const deathTimeframe = 30000;
let deathCount = {};
let serverStatus = {};
let onlineDuration = {};

function updateStatusFile() {
    const updatedServers = Object.entries(serverStatus).map(([name, status]) => {
        return {
            name: name,
            status: status.status,
            nuked: status.nuked || false,
            disabled: false
        };
    });

    let originalServers;
    try {
        originalServers = JSON.parse(fs.readFileSync('servers.json'));
    } catch (err) {
        return;
    }

    const mergedServers = originalServers.map(server => {
        const updatedServer = updatedServers.find(s => s.name === server.name);
        return {
            ...server,
            ...updatedServer,
            disabled: server.disabled || false
        };
    });

    fs.writeFileSync('stat.json', JSON.stringify(mergedServers, null, 2));
    generateFinalJSON(mergedServers);
}

function generateFinalJSON(servers) {
    const finalData = servers.map(server => ({
        name: server.name,
        ip: server.ip,
        port: server.port,
        status: serverStatus[server.name]?.status || 'offline'
    }));
    fs.writeFileSync('status.json', JSON.stringify(finalData, null, 2));
}

function chkServer(server) {
    const { ip, port, name } = server;

    if (!serverStatus[name]) {
        serverStatus[name] = { status: 'offline', nuked: false };
    }

    const connectClient = () => {
        const client = mineflayer.createBot({
            host: ip,
            port: port,
            username: randUsername(5),
            version: '1.18.2'
        });

        deathCount[name] = 0;
        onlineDuration[name] = 0;

        client.on('spawn', () => {
            serverStatus[name].status = 'online';
            onlineDuration[name] += 1;
            updateStatusFile();
        });

        client.on('error', () => {});

        client.on('death', () => {
            deathCount[name]++;
            if (deathCount[name] >= deathThreshold) {
                serverStatus[name].nuked = true;
                updateStatusFile();
            }
        });
        client.on('chat', (u, m) => {
            if (m.toLowerCase().startsWith("what server is this")) {
                client.chat(`This is ${name}, ${u}.`);
            }
        });

        client.on('end', () => {
            serverStatus[name].status = 'offline';
            onlineDuration[name] = 0;
            updateStatusFile();
            setTimeout(connectClient, 6000);
        });

        client.on('kick', (reason) => {
            if (reason.translate === "disconnect.genericReason" && reason.with.includes("Internal Exception: io.netty.handler.codec.EncoderException: java.io.UTFDataFormatException")) {
                serverStatus[name].nuked = true;
                updateStatusFile();
            }
        });
    };

    if (server.disabled) {
        serverStatus[name] = { status: 'disabled', nuked: false };
        updateStatusFile();
    } else {
        connectClient();
    }
}

module.exports = { chkServer, serverStatus };
