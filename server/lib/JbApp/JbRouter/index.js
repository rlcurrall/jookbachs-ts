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
     * @param {object} router
     * @param {object} [options]
     * @memberof JbRouter
     */
    constructor (JbExpress, options) {

        if (this.constructor === JbRouter) {
            throw new TypeError('Abstract class "JbRouter" cannot be instantiated directly.');
        }

        this.JbExpress = JbExpress;
        this.url = '/';

        if (options) {
            if (options.Logger)
                this.Logger = options.Logger;
            if (options.url)
                this.url = options.url;
            if (options.DB)
                this.DB = options.DB;
            if (options.config)
                this.config = options.config;
        }
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

module.exports = JbRouter;