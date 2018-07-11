/**
 * 
 * @param {*} deps 
 */
function apiRouter(deps) {

	let Logger = deps.Logger;
	let bodyParser;
	let libraries;

	if (!deps.bodyParser || !deps.libraries) {
		throw new Error('[ apiCtrl ] Missing Dependency: bodyParser and libraries are required');
	}

	bodyParser = deps.bodyParser;
	libraries = deps.libraries;

	/**
	 * 
	 * @param {*} router 
	 */
	function assignRoutes(router) {

		router.use(bodyParser.urlencoded({
			extended: true
		}));
		router.use(bodyParser.json());

		router.get('/getlibrary', function (req, res, next) {
			res.status(200).json(libraries[0].getAllTracks());
			next();
		});

		router.post('/authTest', function (req, res, next) {

			//console.log(req.body.sharedKey);

			if (req.body.sharedKey === config.sharedKey) {
				res.status(202).end();
			} else {
				res.status(401).end();
			}

			next();

		});

		// log api requests to console
		router.use(function (req, res, next) {
			Logger.log({label: 'API', level: 'request', message: `${req.method} ${req.url}`});
		});
	}

	return {
		assignRoutes: assignRoutes
	}
}

module.exports = apiRouter;