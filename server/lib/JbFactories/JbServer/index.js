/**
 * Factory for the JbServer class that injects all necessary dependencies.
 *
 * @param {object} deps
 * @returns
 */
function serverFactory(deps) {

    // #region Dependency setup
    
    if (!deps.fs || !deps.http || !deps.https || !deps.socketIO || !deps.express) {
        throw new Error('[JbServer] Missing Dependencies: fs and express are required!');
    }

    const fs = deps.fs;
    const http = deps.http;
    const https = deps.https;
    const JbSocket = require('./JbSocket')({socketIO: deps.socketIO});
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
         * @param {object} config
         * @param {object} DB
         * @param {object} Routes
         * @param {object} options
         * @memberof JbServer
         */
        constructor(config, DB, Routes, options) {
            this.config = config;
            this.DB = DB;
            this.Routes = Routes;

            // Read in options
            if (options) {
                if (options.Logger)
                    this.Logger = options.Logger;
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
            // TLS options
            let tlsOptions = {
                key: fs.readFileSync(this.config.tlsOptions.keyPath),
                cert: fs.readFileSync(this.config.tlsOptions.crtPath)
            };

            // HTTP Server
            this.httpServer = http.createServer(function (req, res) {
                let host = req.headers.host.split(':')
                res.writeHead(301, {
                    "Location": `https://${host[0]}:${that.config.httpsPort}${req.url}`
                });
                res.end();
            }).listen(this.config.httpPort);
    
            // HTTPS Server
            this.tlsServer = https.createServer(tlsOptions, this.jbExpress.getApp()).listen(this.config.httpsPort);
    
            // Socket on HTTPS Server
            this.socket = new JbSocket( this.tlsServer, { Logger: this.Logger } );
            this.socket.startListening();

            this._log('JbServer', 'info', 'Server Started');
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
                this._log('JbServer', 'info', 'Destroying sockets');
                that.socket.closeSockets();
            }
            catch (e) {
                this._log('JbServer', 'error', `Could not destory sockets`);
                return e;
            }

            try {
                this._log('JbServer', 'info', 'Closing HTTP server');
                that.httpServer.close();
            }
            catch (e) {
                this._log('JbServer', 'error', `Could not close HTTP server`);
                return e;
            }

            try {
                this._log('JbServer', 'info','Closing HTTPS server');
                that.tlsServer.close();
            }
            catch (e) {
                this._log('Shutdown', 'error', `Could not close HTTPS server`);
                return e;
            }

            return null;
        }

        /**
         * Used to define a router and assign the router to the express app. Receives 
         * a concrete implementation of the JbRouter.
         *
         * @param {object} router
         * @memberof JbServer
         */
        createRoute(router) {
            let r = new router( this.config, this.DB, { Logger: this.Logger } );
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
                    that._log('Shutdown', 'info', 'Destroying sockets');
                    that.socket.closeSockets();
                    return null;
                }
                catch (e) {
                    that._log('Shutdown', 'error', `Could not destory sockets`);
                    return e;
                }
            };

            funcs.push(shutdownSockets);

            // Attempts to shutdown HTTP server
            let shutdownHttp = function () {
                try {
                    that._log('Shutdown', 'info', 'Closing HTTP server');
                    that.httpServer.close();
                    return null;
                }
                catch (e) {
                    that._log('Shutdown', 'error', `Could not close HTTP server`);
                    return e;
                }
            };

            funcs.push(shutdownHttp);

            // Attempts to shutdown HTTPS server
            let shutdownHttps = function () {
                try {
                    that._log('Shutdown', 'info', 'Closing HTTP server');
                    that.tlsServer.close();
                    return null;
                }
                catch (e) {
                    that._log('Shutdown', 'error', `Could not close HTTP server`);
                    return e;
                }
            };

            funcs.push(shutdownHttps);

            return funcs;
        }

        /**
         * Private Logger used by the JbServer class.
         * @private
         *
         * @param {object} label
         * @param {object} level
         * @param {object} msg
         * @memberof JbServer
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

    return JbServer;
}

module.exports = serverFactory;