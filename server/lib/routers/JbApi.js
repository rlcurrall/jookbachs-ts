/**
 * 
 * @param {*} deps 
 */
function apiRouter(deps) {

	// #region Dependency Setup

	let Logger = deps.Logger;
	let bodyParser;

	if (!deps.bodyParser) {
		throw new Error('[ apiCtrl ] Missing Dependency: bodyParser and libraries are required');
	}

	bodyParser = deps.bodyParser;

	// #endregion

	class JbApi {
		/**
		 * 
		 * @param {*} config 
		 * @param {*} DB 
		 */
		constructor(config, DB) {
            this.publicPath = `${config.appDir}\\public\\`;
            this.DB = DB;
			this.url = '/api';
		}

		/**
		 * 
		 * @param {*} router 
		 */
		assignRoute(router) {
            // Expose lib to router -- this will likely not be necessary when we start using the mongodb to store data
            let lib = this.DB;

			router.use(bodyParser.urlencoded({
				extended: true
			}));
			router.use(bodyParser.json());
	
			router.get('/getlibrary', function (req, res, next) {
				res.status(200).json(lib[0].getAllTracks());
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
			
            Logger.log({label: 'JbApi', level: 'info', message: 'Route Created'});
		}

		/**
		 * 
		 */
		getUrl() {
			return this.url;
		}
	}

	return JbApi;
}

module.exports = apiRouter;