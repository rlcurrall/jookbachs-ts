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
    let config;
    let Socket;
    let ExpressApp;
    
    if (!deps.fs || !deps.http || !deps.https || !deps.config) {
        Logger.log({label:'DbService', level: 'error', message: `Missing Dependency: Logger, fs, http, https, config, and socketService are required!`});
        // Add error handling...
    }

    fs = deps.fs;
    http = deps.http;
    https = deps.https;
    config = deps.config;
    Socket = deps.Socket;
    ExpressApp = deps.ExpressApp;

    // #endregion

    class Server {
        constructor() {
            // TLS options
            const tlsOptions = {
                key: fs.readFileSync(config.tlsOptions.keyPath),
                cert: fs.readFileSync(config.tlsOptions.crtPath)
            };

            this.expressApp = new ExpressApp().app;
            this.httpServer = http.createServer(function (req, res) {
                res.writeHead(301, {
                    "Location": `https://${req.headers.host}${req.url}`
                });
                res.end();
            }).listen(config.httpPort);
    
            // HTTPS Server
            this.tlsServer = https.createServer(tlsOptions, this.expressApp).listen(config.httpsPort);
    
            // Socket on HTTPS Server
            this.socket = new Socket(this.tlsServer);

        }

        closeServer() {
            this.httpServer.close();
            this.tlsServer.close();
            this.socket.closeSockets();
        }
    }

    return {
        Server: Server
    }
}

module.exports = serverFactory;