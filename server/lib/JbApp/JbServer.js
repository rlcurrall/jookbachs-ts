/**
 * @module JbServer
 * @author Robb Currall {rlcurrall}
 */

/**
 * Factory for the JbServer class that injects all necessary dependencies.
 *
 * @param {Object} deps
 * @returns
 */
function serverFactory(deps) {

    // #region Dependency setup
    
    if (!deps.fs || !deps.http) {
        throw new Error('[JbServer] Missing Dependencies: fs and express are required!');
    }

    const fs = deps.fs;
    const http = deps.http;
    const https = deps.https;

    // #endregion

    // Private functions/variables
    const _log = Symbol('log');
    const _diff = Symbol('diff');
    const _db = Symbol('db');
    const _logger = Symbol('Logger');
    const _dbmanager = Symbol('Database Manager');

    /**
     * Interface for creating an HTTPS server with Socket.IO 
     *
     * @class JbServer
     */
    class JbServer {
        
        /**
         * Creates an instance of JbServer.
         * @constructor
         * 
         * @param {Object} DB
         * @param {Object} Routes
         * @param {Object} options
         * @memberof JbServer
         */
        constructor(DB, options) {
            this[_db] = DB;

            // Default values
            let that = this;
            this.httpPort = 8080;
            this.isHttps = false;

            // Read in options
            if (options) {
                if (options.Logger)
                    this[_logger] = options.Logger;
                if (options.dbManager)
                    this[_dbmanager] = options.dbManager;
                if (options.config)
                    this.config = options.config;
                if (options.config.tlsOptions)
                    this.tlsOptions = options.config.tlsOptions;
                if (options.config.httpPort)
                    this.httpPort = options.config.httpPort;
                if (options.config.httpsPort)
                    this.httpsPort = options.config.httpsPort;
                if (options.config.tlsOptions && options.config.httpsPort && https)
                    this.isHttps = true;
                else
                    this[_log]('It is recommended to use HTTPS whenever possible.', 'warn', 'JookBachs');

                // Warn for unsupported options
                let unSup = that[_diff](Object.getOwnPropertyNames(options), ['Logger', 'config', 'JbSocket', 'dbManager']);
                unSup.forEach( (opt) => {
                    that[_log](`The [${opt}] option is not supported`, 'warn');
                });
            }
            
            this[_db].connect();
        }

        getServerInstance() {
            if (this.isHttps)
                return this.tlsServer;
            else
                return this.httpServer;
        }

        // #region DB Interface

        /************************ SELECT ************************/
            getAllRecords(from, options) {
                return this[_db].getAllRecords(from, options);
            }

            getRecordsByQuery(from, where, options) {
                return this[_db].getRecordsByQuery(from, where, options);
            }

            getRecordById(from, id, select) {
                return this[_db].getRecordById(from, id, select);
            }

            getOneRecord(from, where, select) {
                return this[_db].getOneRecord(from, where, select);
            }

        /************************ INSERT ************************/
            insertRecord(into, record) {
                return this[_db].insertRecord(into, record);
            }

        /********************* DB Interface *********************/
            dbInterface(func, args) {
                return this[_dbmanager][func](args);
            }
        // #endregion

        /**
         * Starts the HTTP & HTTPS Servers listening on the ports specified by 
         * the config file.
         *
         * @memberof JbServer
         */
        startServer(ExpressApp) {
            let that = this
            // let JbSocket = this.JbSocket;

            if (this.isHttps) {
                // TLS options
                let tlsOptions = {
                    key: fs.readFileSync(this.tlsOptions.keyPath),
                    cert: fs.readFileSync(this.tlsOptions.crtPath)
                };

                // HTTP Server
                this.httpServer = http.createServer(function (req, res) {
                    let host = req.headers.host.split(':')
                    res.writeHead(301, {
                        "Location": `https://${host[0]}:${that.httpsPort}${req.url}`
                    });
                    res.end();
                }).listen(this.httpPort);
        
                // HTTPS Server
                this.tlsServer = https.createServer(tlsOptions, ExpressApp).listen(this.httpsPort);
            } else {
                this.httpServer = http.createServer(ExpressApp).listen(this.httpPort);
            }

            this[_log]('Server Started');
        }

        /**
         * Closes server from receiving requests from HTTP, HTTPS, or Sockets. Returns
         * null on a success or an error object on a failure.
         *
         * @returns
         * @memberof JbServer
         */
        stopServer() {
            let that = this
            try {
                this[_log]('Destroying sockets', 'info', 'Shutdown');
                that.socket.closeSockets();
            }
            catch (e) {
                this[_log](`Could not destory sockets`, 'error', 'Shutdown');
                return e;
            }

            try {
                this[_log]('Closing HTTP server', 'info', 'Shutdown');
                that.httpServer.close();
            }
            catch (e) {
                this[_log](`Could not close HTTP server`, 'error', 'Shutdown');
                return e;
            }

            try {
                this[_log]('Closing HTTPS server', 'info', 'Shutdown');
                that.tlsServer.close();
            }
            catch (e) {
                this[_log](`Could not close HTTPS server`, 'error', 'Shutdown');
                return e;
            }

            return null;
        }

        [_diff](a, b) {
            return a.filter(function (i) {
                return b.indexOf(i) === -1;
            });
        }

        /**
         * Private Logger used by the JbServer class.
         *
         * @param {string} message
         * @param {string} [level]
         * @param {string} [label]
         * @memberof JbServer
         */
        [_log] (message, level, label) {
            if (this[_logger]) {
                if (label === undefined)
                    label = 'JbServer';
                if (level === undefined)
                    level = 'info';
                this[_logger].log({label, level, message});
            }
            else {
                console.log(message);
            }
        }
    }

    return Object.freeze(JbServer);
}

module.exports = serverFactory;