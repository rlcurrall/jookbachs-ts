/**
 * 
 * @param {*} deps 
 */
function serverFactory(deps) {
    let Logger;
    let fs;
    let http;
    let https;
    let config;
    let socketService;

    Logger = deps.Logger;
    
    if (!deps.fs || !deps.http || !deps.https || !deps.config) {
        Logger.log({label:'DbService', level: 'error', message: `Missing Dependency: Logger, fs, http, https, config, and socketService are required!`});
        // Add error handling...
    }

    fs = deps.fs;
    http = deps.http;
    https = deps.https;
    config = deps.config;
    socketService = deps.socketService;

    // TLS options
    const tlsOptions = {
        key: fs.readFileSync(config.tlsOptions.keyPath),
        cert: fs.readFileSync(config.tlsOptions.crtPath)
    };

    /**
     * 
     * @param {*} expressApp 
     */
    function createServer(expressApp) {

        // HTTP Server (redirect to https)
        let httpServer = http.createServer(function (req, res) {
            res.writeHead(301, {
                "Location": `https://${req.headers.host}${req.url}`
            });
            res.end();
        }).listen(config.httpPort);

        // HTTPS Server
        let tlsServer = https.createServer(tlsOptions, expressApp).listen(config.httpsPort);

        // Socket on HTTPS Server
        socketService.init(tlsServer);
    }

    return {
        createServer: createServer
    }
}

module.exports = serverFactory;