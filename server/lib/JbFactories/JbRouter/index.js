/**
 * Abstract class use to define the base functionality of the routes to be used by the JbServer.
 * 
 * @module jbrouter
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
    constructor (config, DB, options) {

        if (this.constructor === JbRouter) {
            throw new TypeError('Abstract class "JbRouter" cannot be instantiated directly.');
        }

        if (this.assignRoute === undefined) {
            throw new TypeError('Classes extending JbRouter must implement the assignRoute method');
        }

        if (options) {
            if (options.Logger)
                this.Logger = options.Logger;
        }

        this.config = config;
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
     *
     *
     * @param {string} msg
     * @param {string} [level]
     * @param {string} [label]
     * @memberof JbRouter
     */
    log (msg, level, label) {
        if (this.Logger) {
            if (label === undefined)
                label = 'JbRouter';
            this.Logger.log({label: label, level: level, message: msg});
        }
        else {
            console.log(msg);
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

module.exports = JbRouter;