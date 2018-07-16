
function webUIFactory (deps) {

    if (!deps.express) {
		throw new Error('[ JbWebUI ] Missing Dependency: express is config are required');
	}

	const express = deps.express;
    const JbRouter = require('JbRouter');

    class JbWebUI extends JbRouter {

        constructor (config, DB) {
            super(config, DB);
            this.url = '/';
            this.publicPath = `${config.appDir}\\public\\`;
        }

        assignRoute(router) {
            router.use(express.static(this.publicPath));
            this.log('JbWebUI', 'info', 'Route Created');
        }
    }

    return JbWebUI;
}

module.exports = webUIFactory;