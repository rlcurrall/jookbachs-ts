/**
 * Factory for the JbScripts class that injects all necessary dependencies.
 *
 * @param {object} deps
 * @returns
 */
function scriptsFactory (deps) {

    // #region Dependency Setup
    if (!deps.express) {
		throw new Error('[ scriptsCtrl ] Missing Dependency: path, express, and config are required');
	}

	const express = deps.express;
    const JbRouter = require('JbRouter');
    // #endregion

    /**
     * Concrete implementation of the JbRouter class defining the /scripts route.
     *
     * @class JbScripts
     * @extends {JbRouter}
     */
    class JbScripts extends JbRouter {

        /**
         * Creates an instance of JbScripts.
         * @constructor
         * 
         * @param {object} config
         * @param {object} DB
         * @param {object} options
         * @memberof JbScripts
         */
        constructor (config, DB, options) {
            super(config, DB, options);
            this.url = '/scripts';
            this.scriptPath = `${config.appDir}/node_modules/`;
        }


        /**
         * Defines all responses for the JbScripts router
         *
         * @param {*} router
         * @memberof JbScripts
         */
        assignRoute(router) {
            router.use(express.static(this.scriptPath));
            this.log( 'Route Created', 'info', 'JbScripts' );
        }
    }

    return JbScripts;
}

module.exports = scriptsFactory;