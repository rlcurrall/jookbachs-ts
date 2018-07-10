/**
 * 
 * @param {*} deps 
 */
function expressService(deps) {
    let Logger;
    let express;
    let webuiRouter;
    let scriptsRouter;
    let apiRouter;
    let streamRouter;
    
    Logger = deps.Logger;

    if (!deps.express) {
        Logger.log({label:'DbService', level: 'error', message: `Missing Dependency: express is required!`});
        // Add error handling...
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