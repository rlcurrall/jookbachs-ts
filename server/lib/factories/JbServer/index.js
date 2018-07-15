/**
 * A factory used to inject dependencies for the JbServer class
 * 
 * @param {object} deps - an object containing all the dependencies needed for the application
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

    class JbServer {
        /**
         * Constructor for the JbServer
         * 
         * @param {JSON object} config - JSON object that contains all configuration needed for the server
         * @param {MongoClient} DB - Database instance that is used by the application
         * @param {Array} Routes - An array of Router Factories that is used to define the routes for the express app 
         */
        constructor(config, DB, Routes) {
            this.config = config;
            this.DB = DB;
            this.Routes = Routes;
        }

        /**
         * Starts the Server listening on the specified ports.
         */
        startServer() {
            this.initExpress();
            this.openServer();
            this.log('JbServer', 'info', 'Server Created');
        }

        /**
         * Creates an express app and assigns all the routes that will be used
         * by the application that were provided by the constructor.
         */
        initExpress() {
            // Create app factory
            let jbExpress = new JbExpress(this.Logger);

            // Assign routes
            for (let r in this.Routes) {
                this.createRoute(jbExpress, this.Routes[r]);
            }

            // return app
            this.app = jbExpress.getApp();
        }

        /**
         * Used to define a router and assign the router to the express app
         * 
         * @param {*} appFactory 
         * @param {*} router 
         */
        createRoute(appFactory, router) {
            let r = new router(this.config, this.DB);
            r.setLogger(this.Logger);

            appFactory.setRoute(r);
        }

        /**
         * Initializes the server to listen on the defined ports and creates a
         * socket listener for the HTTPS port.
         */
        openServer() {
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
            this.tlsServer = https.createServer(tlsOptions, this.app).listen(this.config.httpsPort);
    
            // Socket on HTTPS Server
            this.socket = new JbSocket(this.tlsServer, this.Logger);
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

            // Attempts to shutdown HTTP server
            let shutdownHttp = function () {
                try {
                    that.log('Shutdown', 'info', 'Closing HTTP server');
                    httpServer.close();
                    return null;
                }
                catch (e) {
                    that.log('Shutdown', 'error', `Could not close HTTP server`);
                    return e;
                }
            };

            funcs.push(shutdownHttp);

            // Attempts to shutdown HTTPS server
            let shutdownHttps = function () {
                try {
                    that.log('Shutdown', 'info','Closing HTTPS server');
                    tlsServer.close();
                    return null;
                }
                catch (e) {
                    that.log('Shutdown', 'error', `Could not close HTTPS server`);
                    return e;
                }
            };

            funcs.push(shutdownHttps);

            // Attempts to destory all active sockets
            let shutdownSockets = function () {
                try {
                    that.log('Shutdown', 'info', 'Destroying sockets');
                    socket.closeSockets();
                    return null;
                }
                catch (e) {
                    that.log('Shutdown', 'error', `Could not destory sockets`);
                    return e;
                }
            };

            funcs.push(shutdownSockets);

            return funcs;
        }

        /**
         * Sets the logger to be used by the server and all it's components
         * 
         * @param {Winston Logger} logger - a winston logger that implements the log() method
         */
        setLogger (logger) {
            this.Logger = logger;
        }

        /**
         * The logging function of the server, designed to use the Winston logger
         * though if no logger is present, will use the standard output to console.
         * 
         * @param {string} label - defines the module that is generating the message
         * @param {string} level - defines the level of the message (info, error, etc.)
         * @param {string/error} msg - the message to be displayed
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

    return JbServer;
}

module.exports = serverFactory;