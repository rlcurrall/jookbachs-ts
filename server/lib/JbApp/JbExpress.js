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
    if (!deps.express) {
        throw new Error('[JbExpress] Missing Dependency: express is required!');
    }

    express = deps.express;
    bodyParser = deps.bodyParser;

    // #endregion

    const _log = Symbol('_log');
    const _app = Symbol('app');
    const _server = Symbol('server');
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
        constructor(JbServer, options) {
            if (options) {
                if (options.Logger)
                    this.Logger = options.Logger;
            }

            this[_app] = express();
            this[_log]('Express App Created');
            this[_server] = JbServer;

            JbServer.startServer(this[_app]);
        }

        getAllRecords(collection, options) {
            return this[_server].getAllRecords(collection, options);
        }

        setStatic(url, path) {
            let router = express.Router();
            router.use(express.static(path));
            this[_app].use(url, router);
        }

        setSingleRoute(url, func) {
            let router = express.Router();
            router.use(func);
            this[_app].use(url, router);
        }

        setCustomRoute(url, router) {
            this[_app].use(url, router);
        }

        Router(useBodyParser) {
            let router = express.Router();
            if (useBodyParser) {
                router.use(bodyParser.urlencoded({extended: true}));
                router.use(bodyParser.json());
            }
            return router;
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
        [_log] (message, level, label) {
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

    return Object.freeze(JbExpress);
}

module.exports = expressFactory;