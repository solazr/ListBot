function randChar(charset) {
    return charset[Math.floor(Math.random() * charset.length)];
}

function randUsername(length) {
    const jpChars = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん';
    const cnChars = '的一是在有个这了他和';
    let username = '';
    
    for (let i = 0; i < length; i++) {
        const randomChar = (i % 2 === 0) 
            ? randChar(jpChars) 
            : randChar(cnChars);
        username += `§${randomChar}`;
    }
    
    return username;
}

module.exports = { randUsername };
