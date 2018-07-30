/**
 * @module JbExpress
 * @author Robb Currall {rlcurrall}
 */

/**
 * Factory for the JbExpress class that injects all necessary dependencies.
 *
 * @param {object} deps
 * @returns
 */
function expressFactory(deps) {

    // #region Dependency setup

    let express;

    if (!deps.express) {
        throw new Error('[JbExpress] Missing Dependency: express is required!');
    }

    express = deps.express;

    // #endregion

    /**
     * Interface to Express used by the JbServer.
     *
     * @class JbExpress
     */
    class JbExpress { 

        /**
         * Creates an instance of JbExpress.
         * @constructor
         * 
         * @param {object} options
         * @memberof JbExpress
         */
        constructor(options) {
            if (options) {
                if (options.Logger)
                    this.Logger = options.Logger;
            }

            this._app = express();
            this._log('Express App Created');
        }

        /**
         * Sets a route for the Express app, receives a concrete implementation
         * of the JbRouter class.
         *
         * @param {object} router
         * @memberof JbExpress
         */
        setRoute(router) {
            let route = express.Router();

            this._app.use(router.getUrl(), route);

            router.assignRoute(route);
        }

        /**
         * Used to retrieve the Express app created by this class
         *
         * @returns
         * @memberof JbExpress
         */
        getApp() {
            return this._app;
        }

        
        /**
         * Private Logger used by the JbExpress class
         * @private
         *
         * @param {object} message
         * @param {object} [level]
         * @param {object} [label]
         * @memberof JbExpress
         */
        _log (message, level, label) {
            if (this.Logger) {
                if (label === undefined)
                    label = 'JbExpress';
                if (level === undefined)
                    level = 'info';
                this.Logger.log({label, level, message});
            }
            else {
                console.log(message);
            }
        }
    }

    return JbExpress;
}

module.exports = expressFactory;