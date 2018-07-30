/**
 * @module JbAppManager
 * @author Robb Currall {rlcurrall}
 */

const readline = require('readline'); // Required here as to not expose module to rest of app

/**
 * Manages the application shutdown (may look into observer/child processes in nodejs to expand on this module)
 *
 * @class JbAppManager
 */
class JbAppManager {
    
    /**
     * Creates an instance of JbAppManager.
     * @memberof JbAppManager
     */
    constructor (functions, options) {
        this.functions = functions;
        let that = this;
        
        if (options) {
            if (options.Logger)
                this.Logger = options.Logger;
            
            // Warn for unsupported options
            let unSup = Object.getOwnPropertyNames(options).diff(['Logger']);
            unSup.forEach( (opt) => {
                that.log(`The [${opt}] option is not supported`, 'warn');
            });
        }

        if (process.stdin.isTTY) {
            if (process.platform === "win32") {
                let rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });
    
                rl.on("SIGINT", function () {
                    process.emit("SIGINT");
                });
            }
    
            process.on("SIGINT", function () {
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
                        that.log(error, "error");
                        that.log(`Exiting now`);
                        process.exit();
                    }
                });
            });

            that.log("Shutdown Manager created");
        } else {
            that.log("Terminal not supported by JbAppManager, must be TTY", "warn");
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

    
    /**
     * Logger used by JbAppManageer
     *
     * @param {string} message
     * @param {string} [level]
     * @param {string} [label]
     * @memberof JbAppManager
     */
    log(message, level, label) {
        if (this.Logger) {
            if (label === undefined)
                label = 'JbAppManager';
            if (level === undefined)
                level = 'info';
            this.Logger.log({label, level, message});
        }
        else {
            console.log(message);
        }
        
    }
}

Array.prototype.diff = function (a) {
    return this.filter(function (i) {
        return a.indexOf(i) === -1;
    });
};

module.exports = JbAppManager;