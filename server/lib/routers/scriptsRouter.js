/**
 * 
 * @param {*} deps 
 */
function scriptsRouter(deps) {

	let path;
	let express;
	let config;

	if (!deps.path || !deps.express || !deps.config) {
		throw new Error('[ scriptsCtrl ] Missing Dependency: path, express, and config are required');
	}

	path = deps.path;
	express = deps.express;
	config = deps.config;

	const scriptPath = path.join(config.appDir, '/node_modules');

	/**
	 * 
	 * @param {*} router 
	 */
	function assignRoutes(router) {
		router.use(express.static(scriptPath))
	}

	return {
		assignRoutes: assignRoutes
	}
}

module.exports = scriptsRouter;