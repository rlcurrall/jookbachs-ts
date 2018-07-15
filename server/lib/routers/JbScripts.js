
function scriptsFactory (deps) {

    if (!deps.express) {
		throw new Error('[ scriptsCtrl ] Missing Dependency: path, express, and config are required');
	}

	const express = deps.express;
    const JbRouter = require('JbRouter');

    class JbApi extends JbRouter {

        constructor (config, DB) {
            super(config, DB, '/scripts');
            this.scriptPath = `${config.appDir}\\node_modules\\`;
        }

        assignRoute(router) {
            router.use(express.static(this.scriptPath));
            this.log('JbScripts', 'info', 'Route Created');
        }
    }

    return JbApi;
}

module.exports = scriptsFactory;