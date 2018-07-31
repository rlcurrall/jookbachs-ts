/**
 * @module JbAppManager
 * @author Robb Currall {rlcurrall}
 */

const readline = require('readline'); // Required here as to not expose module to rest of app

// Private functions
const _log = Symbol('log');
const _diff = Symbol('diff');

/**
 * Manages the application shutdown
 *
 * @class JbAppManager
 */
class JbAppManager {
    
    /**
     * Creates an instance of JbAppManager.
     * 
     * @param {array} functions
     * @param {object} options
     * @memberof JbAppManager
     */
    constructor (functions, options) {
        this.functions = functions;
        let that = this;
        
        if (options) {
            if (options.Logger)
                this.Logger = options.Logger;
            
            // Warn for unsupported options
            let unSup = that[_diff](Object.getOwnPropertyNames(options), ['Logger']);
            unSup.forEach( (opt) => {
                that[_log](`The [${opt}] option is not supported`, 'warn');
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
                that[_log]('Starting shutdown process');
    
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
                        that[_log]('Shutdown complete');
                        process.exit();
                    }
                    else 
                    {
                        that[_log](error, "error");
                        that[_log](`Exiting now`);
                        process.exit();
                    }
                });
            });

            that[_log]("Shutdown Manager created");
        } else {
            that[_log]("Terminal not supported by JbAppManager, must be TTY", "warn");
        }
    }
	

    /**
     * Set the list of function to be executed on shutdown
     * 
     * @param {array} funcArray 
     * @memberof JbAppManager
     */
    setShutdownFunctions (funcArray) {
        this.functions = funcArray;
    }

    /**
     * Append a function to the list of functions to be executed on shutdown
     * 
     * @param {function} func 
     * @memberof JbAppManager
     */
    addShutdownFunc (func) {
        this.functions.push(func);
    }

    /**
     * Private function to find the difference between two arrays.
     * @private
     * 
     * @param {array} a 
     * @param {array} b 
     * @memberof JbAppManager
     */
    [_diff](a, b) {
        return a.filter(function (i) {
            return b.indexOf(i) === -1;
        });
    }
    
    /**
     * Logger used by JbAppManageer
     * @private
     *
     * @param {string} message
     * @param {string} [level]
     * @param {string} [label]
     * @memberof JbAppManager
     */
    [_log](message, level, label) {
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

module.exports = JbAppManager;