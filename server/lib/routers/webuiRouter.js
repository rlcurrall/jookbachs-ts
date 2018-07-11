/**
 * 
 * @param {*} deps 
 */
function webuiRouter(deps) {

	let path;
	let express;
	let config;

	if (!deps.path || !deps.express || !deps.config) {
		throw new Error('[ webuiCtrl ] Missing Dependency: path, express, and config are required');
	}

	path = deps.path;
	express = deps.express;
	config = deps.config;

	const publicPath = path.join(config.appDir, '/public/');

	/**
	 * 
	 * @param {*} router 
	 */
	function assignRoutes(router) {
		router.use(express.static(publicPath))
	}

	return {
		assignRoutes: assignRoutes
	}
}

module.exports = webuiRouter;