/**
 * @module JbRouter
 * @author Robb Currall {rlcurrall}
 */

/**
 * Abstract class use to define the base functionality of the routes to be used by the JbServer.
 *  
 * @abstract
 * @class JbRouter
 */
class JbRouter {
    
    /**
     * Creates an instance of JbRouter.
     * @constructs
     * 
     * @param {object} config
     * @param {object} DB
     * @param {object} [options]
     * @memberof JbRouter
     */
    constructor (DB, options) {

        if (this.constructor === JbRouter) {
            throw new TypeError('Abstract class "JbRouter" cannot be instantiated directly.');
        }

        if (this.assignRoute === undefined) {
            throw new TypeError('Classes extending JbRouter must implement the assignRoute method');
        }

        if (options) {
            if (options.Logger)
                this.Logger = options.Logger;
            if (options.config)
                this.config = options.config;

            // Warn for unsupported options
            let unSup = Object.getOwnPropertyNames(options).diff(['Logger', 'config']);
            unSup.forEach( (opt) => {
                that.log(`The [${opt}] option is not supported`, 'warn');
            });
        }

        this.DB = DB;
        this.url = '/';
    }
    
    /**
     * Returns the url of this instance of the JbRouter
     *
     * @returns {string}
     * @memberof JbRouter
     */
    getUrl () {
        return this.url;
    }

    /**
     * Logger used by the concrete implemenation of the JbRouter class.
     *
     * @param {string} message
     * @param {string} [level]
     * @param {string} [label]
     * @memberof JbRouter
     */
    log (message, level, label) {
        if (this.Logger) {
            if (label === undefined)
                label = 'JbRouter';
            if (level === undefined)
                level = 'info';
            this.Logger.log({label, level, message});
        }
        else {
            console.log(message);
        }
    }

    
    /**
     * Method to define all responses for the JbRouter, must be implemented by a concrete implementation of the JbRouter class.
     *
     * @memberof JbRouter
     */
    assignRoute () {
        throw new ReferenceError('Classes extending JbRouter must implement the assignRoute method');
    }
}

Array.prototype.diff = function (a) {
    return this.filter(function (i) {
        return a.indexOf(i) === -1;
    });
};

module.exports = JbRouter;