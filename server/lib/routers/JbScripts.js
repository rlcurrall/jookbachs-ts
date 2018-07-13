/**
 * 
 * @param {*} deps 
 */
function scriptsRouter(deps) {

	// #region Dependency Setup

	let express;
	let Logger = deps.Logger;

	if (!deps.express) {
		throw new Error('[ scriptsCtrl ] Missing Dependency: path, express, and config are required');
	}

	express = deps.express;

	// #endregion

	class JbScripts {
		/**
		 * 
		 * @param {*} config 
		 */
		constructor(config, DB) {
			this.scriptPath = `${config.appDir}\\node_modules\\`;
			this.url = '/scripts';
		}

		/**
		 * 
		 * @param {*} router 
		 */
		assignRoute(router) {
			router.use(express.static(this.scriptPath));
            Logger.log({label: 'JbScripts', level: 'info', message: 'Route Created'});
		}

		/**
		 * 
		 */
		getUrl() {
			return this.url;
		}
	}

	return JbScripts;
}

module.exports = scriptsRouter;