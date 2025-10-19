const fs = require('fs');

const useJapanese = false;
const useChinese = false;

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
            let availableSets = [];

            if (useJapanese && jpChars.length > 0) availableSets.push(jpChars);
            if (useChinese && cnChars.length > 0) availableSets.push(cnChars);

            if (availableSets.length === 0) {
                username += randChar(alphanumeric);
                continue;
            }

            const selectedSet = randChar(availableSets);
            const randomChar = randChar(selectedSet);
            username += `§${randomChar}`;
        }
    }

    return username;
}

module.exports = { randUsername };
