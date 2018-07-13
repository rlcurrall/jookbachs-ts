/**
 * 
 * @param {*} deps 
 */
function webuiRouter(deps) {

	// #region Dependency setup
	let express;
	let Logger = deps.Logger;

	if (!deps.express) {
		throw new Error('[ webuiCtrl ] Missing Dependency: path, express, and config are required');
	}

	express = deps.express;

	// #endregion

	class JbWebUI {
		/**
		 * 
		 * @param {*} config 
		 */
		constructor(config) {
			this.publicPath = `${config.appDir}\\public\\`;
			this.url = '/';
		}

		/**
		 * 
		 * @param {*} router 
		 */
		assignRoute(router) {
			router.use(express.static(this.publicPath));
            Logger.log({label: 'JbWebUI', level: 'info', message: 'Route Created'});
		}

		/**
		 * 
		 */
		getUrl() {
			return this.url;
		}
	}

	return JbWebUI;
}

module.exports = webuiRouter;