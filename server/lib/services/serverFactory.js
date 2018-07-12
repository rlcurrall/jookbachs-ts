/**
 * 
 * @param {*} deps 
 */
function serverFactory(deps) {

    // #region Dependency setup

    let Logger = deps.Logger;
    let fs;
    let http;
    let https;
    // let express;
    
    if (false) {
        Logger.log({label:'DbService', level: 'error', message: `Missing Dependency:  are required!`});
        // Add error handling...
    }

    fs = deps.fs;
    http = deps.http;
    https = deps.https;

    // #endregion

    class JbServer {
        /**
         * 
         * @param {*} config 
         * @param {*} JbSocket 
         * @param {*} JbExpress 
         * @param {*} JbWebUI 
         */
        constructor(config, DB, JbSocket, JbExpress, Routes) {
            this.config = config;
            this.DB = DB;
            this.JbExpress = JbExpress;
            this.JbSocket = JbSocket;
            this.Routes = Routes;

            this.initExpress();
            this.openServer();
            Logger.log({label: 'JbServer', level: 'info', message: 'Server Created'});
        }

        /**
         * 
         */
        initExpress() {
            // Create app factory
            let jbExpress = new this.JbExpress();

            // Assign routes
            for (let r in this.Routes) {
                this.createRoute(jbExpress, this.Routes[r]);
            }

            // return app
            this.app = jbExpress.getApp();
        }

        /**
         * 
         * @param {*} appFactory 
         * @param {*} router 
         */
        createRoute(appFactory, router) {
            let r = new router(this.config, this.DB);

            appFactory.setRoute(r);
        }

        /**
         * 
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
            this.socket = new this.JbSocket(this.tlsServer);
        }

        /**
         * 
         */
        closeServer() {
            try {
                Logger.log({label: 'Shutdown', level: 'info', message: 'Closing HTTP server'});
                this.httpServer.close();
            }
            catch (e) {
                Logger.log({label: 'Shutdown', level: 'error', message: `Could not close HTTP server: ${e}`});
            }

            try {
                Logger.log({label: 'Shutdown', level: 'info', message: 'Closing HTTPS server'});
                this.tlsServer.close();
            }
            catch (e) {
                Logger.log({label: 'Shutdown', level: 'error', message: `Could not close HTTPS server: ${e}`});
            }
            
            try {
                Logger.log({label: 'Shutdown', level: 'info', message: 'Destroying sockets'});
                this.socket.closeSockets();
            }
            catch (e) {
                Logger.log({label: 'Shutdown', level: 'error', message: `Could not destory sockets: ${e}`});
            }
        }
    }

    return {
        JbServer: JbServer
    }
}

module.exports = serverFactory;