/**
 * 
 * @param {*} deps 
 */
function expressService(deps) {
    let express;
    let webuiRouter;
    let scriptsRouter;
    let apiRouter;
    let streamRouter;

    if (!deps.express) {
        throw new Error("[ ExpressService ] Missing Dependency: express is required")
    }

    express = deps.express;
    webuiRouter = deps.webuiRouter;
    scriptsRouter = deps.scriptsRouter;
    apiRouter = deps.apiRouter;
    streamRouter = deps.streamRouter;

    /**
     * 
     */
    function createApp() {
        app = express();
        setRoutes(app);

        return app;
    }

    /**
     * 
     * @param {*} app 
     */
    function setRoutes(app) {
        const webui = express.Router();
        const api = express.Router();
        const stream = express.Router();
        const scripts = express.Router();

        app.use('/', webui);
        app.use('/api', api);
        app.use('/stream', stream);
        app.use('/scripts', scripts);

        webuiRouter.assignRoutes(webui);
        apiRouter.assignRoutes(api);
        streamRouter.assignRoutes(stream);
        scriptsRouter.assignRoutes(scripts);
    }

    return {
        createApp: createApp
    }
}

module.exports = expressService;