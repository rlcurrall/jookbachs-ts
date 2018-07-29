/**
 * Factory for the JbApi class that injects all necessary dependencies.
 *
 * @param {object} deps
 * @returns
 */
function webUIFactory (deps) {

    // #region Dependency Setup
    if (!deps.express) {
		throw new Error('[ JbWebUI ] Missing Dependency: express is config are required');
	}

	const express = deps.express;
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
         * @param {Object} config
         * @param {JbDatabase} DB
         * @param {Object} [options]
         * @memberof JbWebUI
         */
        constructor (DB, options) {
            super(DB, options);
            this.url = '/';
            this.publicPath = `${this.config.appDir}/public/`;
        }

        /**
         * Defines all responses for the JbWebUI router.
         *
         * @param {Object} router
         * @memberof JbWebUI
         */
        assignRoute(router) {
            router.use(express.static(this.publicPath));
            this.log('Route Created', 'info', 'JbWebUI');
        }
    }

    return JbWebUI;
}

module.exports = webUIFactory;