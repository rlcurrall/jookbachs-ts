/**
 * 
 * @param {*} deps 
 */
function serverFactory(deps) {

    let fs;
    let http;
    let https;
    let config;
    let socketService;

    if (!deps.fs || !deps.http || !deps.https || !deps.config) {
        throw new Error('[ ServerFactory ] Missing Dependency: fs, http, https, config, and socketService are required');
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