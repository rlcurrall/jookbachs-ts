/**
 * 
 * @param {*} deps 
 */
function expressFactory(deps) {

    // #region Dependency setup

    let Logger;
    let express;
    
    Logger = deps.Logger;

    if (!deps.express) {
        Logger.log({label:'DbService', level: 'error', message: `Missing Dependency: express is required!`});
        // Add error handling...
    }

    express = deps.express;

    // #endregion

    /**
     * 
     */
    class JbExpress {
        constructor() {
            this.app = express();
            Logger.log({label: 'JbExpress', level: 'info', message: 'Express App Created'});
        }

        setRoute(router) {
            let route = express.Router();

            this.app.use(router.getUrl(), route);

            router.assignRoute(route);
        }

        getApp() {
            return this.app;
        }
    }

    return {
        JbExpress: JbExpress
    }
}

module.exports = expressFactory;