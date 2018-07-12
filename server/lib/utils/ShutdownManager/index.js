const readline = require('readline'); // Required here as to not expose module to rest of app
let Logger = require('Logger');

class ShutdownManager {
    constructor (functions) {

        readline.emitKeypressEvents(process.stdin);
        process.stdin.setRawMode(true);

        process.stdin.on('keypress', function (str, key) {
            if (key.ctrl && key.name === 'c'){
                Logger.log({label: 'Shutdown', level: 'info', message: 'Starting shutdown process'});

                Promise.all(functions).then(function (result) {
                    let success = true;
                    let error = '';

                    for (let r in result) {
                        let f = result[r]();
                        
                        if (f !== null) {
                            success = false;
                            error = `${error}\n\n${f}`;
                        }
                    }
                    if (success) {
                        Logger.log({label: 'Shutdown', level: 'info', message: 'Shutdown complete'});
                        process.exit();
                    }
                    else 
                    {
                        Logger.log({label: 'Shutdown', level: 'error', message: `Error: ${error}`});
                        Logger.log({label: 'Shutdown', level: 'info', message: `Exiting now`});
                        process.exit();
                    }
                });
            }
        });
    }
}

module.exports = ShutdownManager;