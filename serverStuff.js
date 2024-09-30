const mineflayer = require('mineflayer');
const { randUsername } = require('./randUser');
const fs = require('fs');

const deathThreshold = 5;
let deathCount = {};
let serverStatus = {};
let onlineDuration = {};
let playerList = {};

function updstatus() {
    const updatedServers = Object.entries(serverStatus).map(([name, statusObj]) => {
        return {
            name: name,
            owner: statusObj.owner,
            status: statusObj.status,
            nuked: statusObj.nuked || false,
            disabled: statusObj.disabled || false,
            players: playerList[name] || ''
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

    fs.writeFileSync('status.json', JSON.stringify(mergedServers, null, 2));
}

function chkServer(server) {
    const { ip, port, name, owner, nospchar } = server;

    if (!serverStatus[name]) {
        serverStatus[name] = { status: 'offline', nuked: false, owner: owner };
    }

    const connectClient = () => {
        let user = randUsername(5, nospchar);
        const client = mineflayer.createBot({
            host: ip,
            port: port,
            username: user,
            version: '1.18.2'
        });
        //console.log(`${name}: ${user}`)
        deathCount[name] = 0;
        onlineDuration[name] = 0;

        client.on('login', () => {
            client.chat('https://kaboom.1wjb.com/status/');
            setTimeout(() => { client.chat('Join the Nova Discord: https://discord.gg/yFPaHsSHHe') }, 1000);
            serverStatus[name].status = 'online';
            onlineDuration[name] += 1;
            setInterval(() => {
                if (client.players) {
                    playerList[name] = Object.keys(client.players).join(', ');
                    updstatus();
                }
            }, 5000);
        });

        client.on('error', () => {});

        client.on('death', () => {
            deathCount[name]++;
            if (deathCount[name] >= deathThreshold) {
                serverStatus[name].nuked = true;
                updstatus();
            }
        });

        client.on('chat', (u, m) => {
            if (m.toLowerCase().startsWith("what server is this")) {
                client.chat(`This is ${name}, owned by ${owner}, ${u}.`);
            }
        });

        client.on('end', () => {
            serverStatus[name].status = 'offline';
            onlineDuration[name] = 0;
            updstatus();
            setTimeout(connectClient, 6000);
        });

        client.on('kicked', (reason) => {
            if (reason.translate === "disconnect.genericReason" && reason.with.includes("Internal Exception: io.netty.handler.codec.EncoderException: java.io.UTFDataFormatException")) {
                const utfKickRegex = /encoded string (.*) too long: (\d+) (.*)/;

                for (const detail of reason.with) {
                    if (utfKickRegex.test(detail)) {
                        serverStatus[name].nuked = true;
                        updstatus();
                        break;
                    }
                }
            }
        });
    };

    if (server.disabled) {
        serverStatus[name] = { status: 'disabled', nuked: false, owner: owner };
        updstatus();
    } else {
        connectClient();
    }
}

module.exports = { chkServer, serverStatus };
