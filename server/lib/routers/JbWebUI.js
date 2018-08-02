/**
 * Factory for the JbApi class that injects all necessary dependencies.
 *
 * @param {object} deps
 * @returns
 */
function webUIFactory (deps) {

    // #region Dependency Setup
    if (!deps.JbRouter) {
		throw new Error('[ JbWebUI ] Missing Dependency: express is config are required');
	}

    const JbRouter = deps.JbRouter;
    // #endregion

    /**
     * Concrete implementation of the JbRouter class defining the / route.
     *
     * @class JbWebUI
     * @extends {JbRouter}
     */
    class JbWebUI extends JbRouter {

        /**
         * Creates an instance of JbWebUI.
         * @constructor
         * 
         * @param {Object} expressRouter
         * @param {Object} [options]
         * @memberof JbWebUI
         */
        constructor (JbExpress, options) {
            super(JbExpress, options);
            this.publicPath = `${this.config.appDir}/public/`;

            this.assignRoute();
        }

        /**
         * Defines all responses for the JbWebUI router.
         *
         * @param {Object} router
         * @memberof JbWebUI
         */
        assignRoute() {
            let that = this;
            this.JbExpress.setStatic(that.url, that.publicPath);

            // let router = this.expressRouter;

            // router.use(express.static(this.publicPath));
            this.log('Route Created', 'info', 'JbWebUI');
        }
    }

    return JbWebUI;
}

module.exports = webUIFactory;