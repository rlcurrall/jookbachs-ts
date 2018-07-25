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
    const JbRouter = require('JbRouter');
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
         * @param {*} config
         * @param {*} DB
         * @param {*} options
         * @memberof JbWebUI
         */
        constructor (config, DB, options) {
            super(config, DB, options);
            this.url = '/';
            this.publicPath = `${config.appDir}/public/`;
        }

        /**
         * Defines all responses for the JbWebUI router.
         *
         * @param {*} router
         * @memberof JbWebUI
         */
        assignRoute(router) {
            router.use(express.static(this.publicPath));
            this.log('JbWebUI', 'info', 'Route Created');
        }
    }

    return JbWebUI;
}

module.exports = webUIFactory;