/**
 * Factory to generate the JbExpress class
 * @param {object} deps - object with all dependencies being injected
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
     * Class to implement the express application used by the JbServer
     */
    class JbExpress {

        /**
         * Express app constructor, creates an express app. 
         */
        constructor(options) {
            if (options) {
                if (options.Logger)
                    this.Logger = options.Logger;
            }

            this._app = express();
            this._log('JbExpress', 'info', 'Express App Created');
        }

        /**
         * Sets a route for the express app
         * 
         * @param {JbRouter Concrete Implementation} router 
         */
        setRoute(router) {
            let route = express.Router();

            this._app.use(router.getUrl(), route);

            router.assignRoute(route);
        }

        /**
         * Used to return the app created by this class
         */
        getApp() {
            return this._app;
        }

        /**
         * Used to log info to the console
         * 
         * @param {string} label 
         * @param {string} level 
         * @param {string/error object} msg 
         */
        _log (label, level, msg) {
            if (this.Logger) {
                this.Logger.log({label: label, level: level, message: msg});
            }
            else {
                console.log(msg);
            }
        }
    }

    return JbExpress;
}

module.exports = expressFactory;