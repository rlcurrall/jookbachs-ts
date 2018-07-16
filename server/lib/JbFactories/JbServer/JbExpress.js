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
        constructor() {
            this.app = express();
        }

        /**
         * Sets a route for the express app
         * 
         * @param {JbRouter Concrete Implementation} router 
         */
        setRoute(router) {
            let route = express.Router();

            this.app.use(router.getUrl(), route);

            router.assignRoute(route);
        }

        /**
         * Used to return the app created by this class
         */
        getApp() {
            return this.app;
        }

        /**
         * Used to set the logger used by the app
         * @param {*} logger 
         */
        setLogger (logger) {
            this.Logger = logger;
        }

        /**
         * Used to log info to the console
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
    }

    return JbExpress;
}

module.exports = expressFactory;