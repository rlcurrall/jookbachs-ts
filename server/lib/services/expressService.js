/**
 * 
 * @param {*} deps 
 */
function expressService(deps) {

    // #region Dependency setup

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

    // #endregion

    /**
     * 
     */
    class ExpressApp {
        constructor() {
            this.app = express();

            const webui = express.Router();
            const api = express.Router();
            const stream = express.Router();
            const scripts = express.Router();

            this.app.use('/', webui);
            this.app.use('/api', api);
            this.app.use('/stream', stream);
            this.app.use('/scripts', scripts);

            webuiRouter.assignRoutes(webui);
            apiRouter.assignRoutes(api);
            streamRouter.assignRoutes(stream);
            scriptsRouter.assignRoutes(scripts);
        }
    }

    return {
        ExpressApp: ExpressApp
    }
}

module.exports = expressService;