const readline = require('readline'); // Required here as to not expose module to rest of app

class ShutdownManager {
    constructor () {
        this.functions = [];
        let that = this;

        readline.emitKeypressEvents(process.stdin);
		
		try {
			process.stdin.setRawMode(true);

			process.stdin.on('keypress', function (str, key) {
				if (key.ctrl && key.name === 'c'){
					that.log('Starting shutdown process');

					Promise.all(that.functions).then(function (result) {
						let success = true;
						let error = '';

						for (let r in result) {
							let f = result[r]();

							if (f !== null) {
								success = false;
								error = `${error}\n${f}\n`;
							}
						}
						if (success) {
							that.log('Shutdown complete');
							process.exit();
						}
						else 
						{
							that.log(`Error: ${error}`);
							that.log(`Exiting now`);
							process.exit();
						}
					});
				}
			});
		}
		catch (e) {
			console.warn('[Shutdown Manager] - Terminal not supported must have a tty/std-in-out attached.');
		}
    }
	

    /**
     * 
     * @param {*} funcArray 
     */
    setShutdownFunctions (funcArray) {
        this.functions = funcArray;
    }

    /**
     * 
     * @param {*} func 
     */
    addShutdownFunc (func) {
        this.functions.push(func);
    }

    setLogger (logger) {
        this.Logger = logger;
    }

    /**
     * 
     * @param {*} msg 
     */
    log(msg) {
        if (this.Logger) {
            this.Logger.log({label: 'Shutdown', level: 'info', message: msg});
        }
        else {
            console.log(msg);
        }
        
    }
}

module.exports = ShutdownManager;