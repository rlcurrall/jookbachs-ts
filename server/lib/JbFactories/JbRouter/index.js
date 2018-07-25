/**
 * Abstract class use to define the base functionality of the routes to
 * be used by the JbServer.
 * 
 * @abstract
 * @class JbRouter
 */
class JbRouter {

    
    /**
     * Creates an instance of JbRouter.
     * @constructor
     * 
     * @param {object} config
     * @param {object} DB
     * @param {object} options
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
     * @returns
     * @memberof JbRouter
     */
    getUrl () {
        return this.url;
    }

    
    /**
     * Logger used by the JbRouter Class
     *
     * @param {object} label
     * @param {object} level
     * @param {object} msg
     * @memberof JbRouter
     */
    log (label, level, msg) {
        if (this.Logger) {
            this.Logger.log({label: label, level: level, message: msg});
        }
        else {
            console.log(msg);
        }
    }

    
    /**
     * Method to define all responses for the JbRouter, must be implemented by a concrete
     * implementation of the JbRouter class.
     *
     * @memberof JbRouter
     */
    assignRoute () {
        throw new ReferenceError('Classes extending JbRouter must implement the assignRoute method');
    }
}

module.exports = JbRouter;