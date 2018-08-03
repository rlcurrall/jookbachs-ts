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
    const _logger = Symbol('Logger');
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
                    this[_logger] = options.Logger;
                if (options.config)
                    this.config = options.config;
            }

            this[_app] = express();
            this[_log]('Express App Created');
            this[_server] = JbServer;

            JbServer.startServer(this[_app]);
        }

        // #region DB Interface
        /************************ SELECT ************************/
            getAllRecords(from, options) {
                return this[_server].getAllRecords(from, options);
            }

            getRecordsByQuery(from, where, options) {
                return this[_server].getRecordsByQuery(from, where, options);
            }

            getRecordById(from, id, select) {
                return this[_server].getRecordById(from, id, select);
            }

            getOneRecord(from, where, select) {
                return this[_server].getOneRecord(from, where, select);
            }

        /************************ INSERT ************************/
            insertRecord(into, record) {
                return this[_server].insertRecord(into, record);
            }

        /************************ DB Interface ************************/
            dbInterface(func, args) {
                return this[_server].dbInterface(func, args);
            }

        // #endregion

        // #region Express Interface
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
        // #endregion
        
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
            if (this[_logger]) {
                if (label === undefined)
                    label = 'JbExpress';
                if (level === undefined)
                    level = 'info';
                this[_logger].log({label, level, message});
            }
            else {
                console.log(message);
            }
        }
    }

    return Object.freeze(JbExpress);
}

module.exports = expressFactory;