/**
 * @description A factory used to inject dependencies for the JbServer class
 * 
 * @param {object} deps - an object containing all the dependencies needed for the application
 * 
 * @returns {class} JbServer class is returned, an HTTP/HTTPS server interface
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
     * @class JbServer
     * @author Robb Currall
     * @description Serves as an interface for the HTTP/HTTPS servers as well as Sockets
     */
    class JbServer {
        /**
         * @description Constructor for the JbServer
         * @author Robb Currall
         * 
         * @param {object} config - Object from JSON that contains all configuration needed for the server
         * @param {MongoClient} DB - Database instance that is used by the application
         * @param {Array} Routes - An array of Router Factories that is used to define the routes for the express app 
         * @param {object} options - An object containing options for the server
         * 
         * @returns {JbServer} - An object used to interface with the HTTP/HTTPS servers and Sockets
         */
        constructor(config, DB, Routes, options) {
            this.config = config;
            this.DB = DB;
            this.Routes = Routes;

            // Read in options
            if (options) {
                if (options.Logger)
                    this.Logger = options.Logger;
                if (options.db) {
                    this.testDB = options.db;
                }
            }
            
            /* Create Express App */
            this.jbExpress = new JbExpress( { Logger: this.Logger } );

            // Assign routes
            for (let r in this.Routes) {
                this.createRoute(this.Routes[r]);
            }
        }

        /**
         * @description Starts the Server listening on the specified ports.
         * @returns {void}
         */
        startServer() {
            // TLS options
            let tlsOptions = {
                key: fs.readFileSync(this.config.tlsOptions.keyPath),
                cert: fs.readFileSync(this.config.tlsOptions.crtPath)
            };

            // HTTP Server
            this.httpServer = http.createServer(function (req, res) {
                res.writeHead(301, {
                    "Location": `https://${req.headers.host}${req.url}`
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
         * @description Close server from receiving requests from HTTP, HTTPS, or Sockets
         * @returns {error} null on success or an error object on a failure
         */
        stopServer() {
            try {
                this._log('Shutdown', 'info', 'Destroying sockets');
                socket.closeSockets();
            }
            catch (e) {
                this._log('Shutdown', 'error', `Could not destory sockets`);
                return e;
            }

            try {
                this._log('Shutdown', 'info', 'Closing HTTP server');
                httpServer.close();
            }
            catch (e) {
                this._log('Shutdown', 'error', `Could not close HTTP server`);
                return e;
            }

            try {
                this._log('Shutdown', 'info','Closing HTTPS server');
                tlsServer.close();
            }
            catch (e) {
                this._log('Shutdown', 'error', `Could not close HTTPS server`);
                return e;
            }

            return null;
        }

        /**
         * Used to define a router and assign the router to the express app
         * 
         * @param {Express App} appFactory 
         * @param {JbRouter Concrete Implementation} router 
         */
        createRoute(router) {
            let r = new router( this.config, this.DB, { Logger: this.Logger, db: this.testDB } );
            // r.setLogger(this.Logger);

            this.jbExpress.setRoute(r);
        }

        /**
         * Returns an array of functions that can be executed to shutdown the server
         */
        getShutdownFunctions() {
            let funcs = [];
            let httpServer = this.httpServer;
            let tlsServer = this.tlsServer;
            let socket = this.socket;
            let that = this;

            // Attempts to destory all active sockets
            let shutdownSockets = function () {
                try {
                    that._log('Shutdown', 'info', 'Destroying sockets');
                    socket.closeSockets();
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
                    httpServer.close();
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
                
            };

            funcs.push(shutdownHttps);

            return funcs;
        }

        /**
         * The logging function of the server, designed to use the Winston logger
         * though if no logger is present, will use the standard output to console.
         * 
         * @param {string} label - defines the module that is generating the message
         * @param {string} level - defines the level of the message (info, error, etc.)
         * @param {string/error} msg - the message to be displayed
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