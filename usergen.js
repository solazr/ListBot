const fs = require('fs');
const jp = false, cn = false;

const rc = c => c[Math.floor(Math.random() * c.length)];
const lc = f => { try { return fs.readFileSync(f,'utf-8').replace(/\s/g,''); } catch(e){ console.error(`Error loading ${f}:`, e); return ''; } };

const a = lc('chars/alphanumeric.txt');
const j = lc('chars/jp.txt');
const z = lc('chars/cn.txt');

function ru(l, ns=false) {
    let u = '';
    for (let i=0;i<l;i++) {
        if (ns) u += rc(a);
        else {
            let s=[];
            if(jp && j.length>0) s.push(j);
            if(cn && z.length>0) s.push(z);
            if(s.length===0){ u+=rc(a); continue; }
            let sel=rc(s);
            u+=`§${rc(sel)}`;
        }
    }
    return u;
}

module.exports = { ru };
