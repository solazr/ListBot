const mineflayer = require('mineflayer');
const { ru } = require('./usergen');
const fs = require('fs');

const dt = 5;
let dc = {};
let ss = {};
let od = {};
let pl = {};

function us() {
    const usrv = Object.entries(ss).map(([n, s]) => ({
        n: n,
        o: s.o,
        st: s.st,
        nk: s.nk || false,
        ds: s.ds || false,
        p: pl[n] || ''
    }));

    let os;
    try { os = JSON.parse(fs.readFileSync('servers.json')); } catch { return; }

    const ms = os.map(s => {
        const usv = usrv.find(u => u.n === s.name);
        return { ...s, ...usv, ds: s.ds || false };
    });

    fs.writeFileSync('/var/www/kbm.solazr.dev/status.json', JSON.stringify(ms, null, 2));
}

function cs(srv) {
    const { ip, port, name, owner, nospchar } = srv;

    if (!ss[name]) ss[name] = { st: 'offline', nk: false, o: owner };

    const cc = () => {
        const u = ru(5, nospchar);
        const c = mineflayer.createBot({ host: ip, port: port, username: u, version: '1.18.2' });

        dc[name] = 0;
        od[name] = 0;

        c.on('login', () => {
            c.chat('listbot created by solazr');
            setTimeout(() => c.chat('https://kbm.solazr.dev [not active atm]'), 1000);
            ss[name].st = 'online';
            od[name] += 1;
            setInterval(() => {
                if (c.players) {
                    pl[name] = Object.keys(c.players).join(', ');
                    us();
                }
            }, 5000);
        });

        c.on('error', () => {});
        c.on('death', () => { 
            dc[name]++; 
            if (dc[name] >= dt) { ss[name].nk = true; us(); } 
        });
        c.on('chat', (u, m) => { if (m.toLowerCase().startsWith("what server is this")) c.chat(`${name} created by ${owner}`); });
        c.on('end', () => { ss[name].st = 'offline'; od[name] = 0; us(); setTimeout(cc, 6000); });

        c.on('kicked', r => {
            if (r.translate === "disconnect.genericReason" && r.with.includes("Internal Exception: io.netty.handler.codec.EncoderException: java.io.UTFDataFormatException")) {
                const re = /encoded string (.*) too long: (\d+) (.*)/;
                for (const d of r.with) { if (re.test(d)) { ss[name].nk = true; us(); break; } }
            }
        });
    };

    if (srv.disabled) { ss[name] = { st: 'disabled', nk: false, o: owner }; us(); } 
    else { cc(); }
}

module.exports = { cs, ss };
