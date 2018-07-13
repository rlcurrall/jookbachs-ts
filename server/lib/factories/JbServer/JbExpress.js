/**
 * 
 * @param {*} deps 
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
     * 
     */
    class JbExpress {
        constructor(logger) {
            this.Logger = logger;
            this.app = express();
            this.log('JbExpress', 'info', 'Express App Created');
        }

        setRoute(router) {
            let route = express.Router();

            this.app.use(router.getUrl(), route);

            router.assignRoute(route);
        }

        getApp() {
            return this.app;
        }

        /**
         * 
         * @param {*} logger 
         */
        setLogger (logger) {
            this.Logger = logger;
        }

        /**
         * 
         * @param {*} label 
         * @param {*} level 
         * @param {*} msg 
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