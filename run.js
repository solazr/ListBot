const { exec } = require('child_process');
let botProcess;
function startBot() {
    botProcess = exec('node bot.js');

    botProcess.stdout.on('data', (data) => {
        console.log(data);
    });
    botProcess.stderr.on('data', (data) => {
        console.error(data);
    });

    botProcess.on('close', (code) => {
        console.log(`bot exited with code ${code}`);
        console.log('Restarting bot...');
        startBot();
    });
}
console.log('Starting...')
startBot();