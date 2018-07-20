/**
 * Abstract class used to define the base functionality of the routers to 
 * be used by the JbServer.
 */
class JbRouter {

    /**
     * Defines base functionality of a JbRouter
     * @param {object} config 
     * @param {MongoClient object} DB 
     */
    constructor (config, DB, options) {

        if (this.constructor === JbRouter) {
            throw new TypeError('Abstract class "JbRouter" cannot be instantiated directly.');
        }

        if (this.assignRoute === undefined) {
            throw new TypeError('Classes extening JbRouter must implement the assignRoute method');
        }

        if (options) {
            if (options.Logger)
                this.Logger = options.Logger;
        }

        this.config = config;
        this.DB = DB;
    }

    /**
     * Returns the URL of the router
     */
    getUrl () {
        return this.url;
    }

    /**
     * Log message to console
     * 
     * @param {string} label 
     * @param {string} level 
     * @param {string/error object} msg 
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
     * Requires user to define the assignRoute function
     */
    assignRoute () {
        throw new ReferenceError('Classes extening JbRouter must implement the assignRoute method');
    }
}

module.exports = JbRouter;