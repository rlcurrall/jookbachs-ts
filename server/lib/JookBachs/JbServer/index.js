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
    
    if (!deps.fs || !deps.http || !deps.express) {
        throw new Error('[JbServer] Missing Dependencies: fs and express are required!');
    }

    const fs = deps.fs;
    const http = deps.http;
    const https = deps.https;
    const JbExpress = require('./JbExpress')({express: deps.express});

    // #endregion

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
        constructor(DB, Routes, options) {
            this.DB = DB;
            this.Routes = Routes;

            // Default values
            let that = this;
            this.httpPort = 8080;
            this.isHttps = false;
            this.isSocket = false;

            // Read in options
            if (options) {
                if (options.Logger)
                    this.Logger = options.Logger;
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
                    this._log('It is recommended to use HTTPS whenever possible.', 'warn', 'JookBachs');
                if (options.JbSocket) {
                    this.isSocket = true;
                    this.JbSocket = options.JbSocket;
                }

                // Warn for unsupported options
                let unSup = Object.getOwnPropertyNames(options).diff(['Logger', 'config', 'JbSocket']);
                unSup.forEach( (opt) => {
                    that._log(`The [${opt}] option is not supported`, 'warn');
                });
            }
            
            /* Create Express App */
            this.jbExpress = new JbExpress( { Logger: this.Logger } );

            // Assign routes
            Routes.forEach( route => {
                this.createRoute(route)
            })
        }

        /**
         * Starts the HTTP & HTTPS Servers listening on the ports specified by 
         * the config file.
         *
         * @memberof JbServer
         */
        startServer() {
            let that = this
            let JbSocket = this.JbSocket;

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
                this.tlsServer = https.createServer(tlsOptions, this.jbExpress.getApp()).listen(this.httpsPort);
        
                // Socket on HTTPS Server
                if (this.isSocket) {
                    this.socket = new JbSocket( this.tlsServer, { Logger: this.Logger } );
                    this.socket.startListening();
                }
            } else {
                this.httpServer = http.createServer(this.jbExpress.getApp()).listen(this.httpPort);
                if (this.isSocket) {
                    this.socket = new JbSocket(this.httpServer, { Logger: this.Logger });
                    this.socket.startListening();
                }
            }

            this._log('Server Started');
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
                this._log('Destroying sockets', 'info', 'Shutdown');
                that.socket.closeSockets();
            }
            catch (e) {
                this._log(`Could not destory sockets`, 'error', 'Shutdown');
                return e;
            }

            try {
                this._log('Closing HTTP server', 'info', 'Shutdown');
                that.httpServer.close();
            }
            catch (e) {
                this._log(`Could not close HTTP server`, 'error', 'Shutdown');
                return e;
            }

            try {
                this._log('Closing HTTPS server', 'info', 'Shutdown');
                that.tlsServer.close();
            }
            catch (e) {
                this._log(`Could not close HTTPS server`, 'error', 'Shutdown');
                return e;
            }

            return null;
        }

        /**
         * Used to define a router and assign the router to the express app. Receives 
         * a concrete implementation of the JbRouter.
         *
         * @param {Object} router
         * @memberof JbServer
         */
        createRoute(router) {
            let r = new router(this.DB, { Logger: this.Logger, config: this.config } );
            this.jbExpress.setRoute(r);
        }

        /**
         * Returns an array of functions that can be executed to shudown the server.
         *
         * @returns
         * @memberof JbServer
         */
        getShutdownFunctions() {
            let funcs = [];
            let that = this;

            // Attempts to destory all active sockets
            let shutdownSockets = function () {
                try {
                    that._log('Destroying sockets', 'info', 'Shutdown');
                    that.socket.closeSockets();
                    return null;
                }
                catch (e) {
                    that._log(`Could not destory sockets`, 'error', 'Shutdown');
                    return e;
                }
            };

            funcs.push(shutdownSockets);

            // Attempts to shutdown HTTP server
            let shutdownHttp = function () {
                try {
                    that._log('Closing HTTP server', 'info', 'Shutdown');
                    that.httpServer.close();
                    return null;
                }
                catch (e) {
                    that._log(`Could not close HTTP server`, 'error', 'Shutdown');
                    return e;
                }
            };

            funcs.push(shutdownHttp);

            // Attempts to shutdown HTTPS server
            let shutdownHttps = function () {
                try {
                    that._log('Closing HTTPS server', 'info', 'Shutdown');
                    that.tlsServer.close();
                    return null;
                }
                catch (e) {
                    that._log(`Could not close HTTPS server`, 'error', 'Shutdown');
                    return e;
                }
            };

            funcs.push(shutdownHttps);

            return funcs;
        }

        /**
         * Private Logger used by the JbServer class.
         *
         * @param {string} message
         * @param {string} [level]
         * @param {string} [label]
         * @memberof JbServer
         */
        _log (message, level, label) {
            if (this.Logger) {
                if (label === undefined)
                    label = 'JbServer';
                if (level === undefined)
                    level = 'info';
                this.Logger.log({label, level, message});
            }
            else {
                console.log(message);
            }
        }
    }

    return JbServer;
}

Array.prototype.diff = function (a) {
    return this.filter(function (i) {
        return a.indexOf(i) === -1;
    });
};

module.exports = serverFactory;