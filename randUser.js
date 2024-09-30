const fs = require('fs');

function randChar(charset) {
    return charset[Math.floor(Math.random() * charset.length)];
}

function loadCharset(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf-8').replace(/\s/g, '');
    } catch (err) {
        console.error(`Error loading charset from ${filePath}:`, err);
        return '';
    }
}

const alphanumeric = loadCharset('chars/alphanumeric.txt');
const jpChars = loadCharset('chars/jp.txt');
const cnChars = loadCharset('chars/cn.txt');

function randUsername(length, nospecialchar = false) {
    let username = '';

    for (let i = 0; i < length; i++) {
        if (nospecialchar) {
            username += randChar(alphanumeric);
        } else {
            const randomChar = (i % 2 === 0) 
                ? randChar(jpChars) 
                : randChar(cnChars);
            username += `§${randomChar}`;
        }
    }

    return username;
}

module.exports = { randUsername };
