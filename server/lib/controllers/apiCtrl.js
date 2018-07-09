
const libraries = require('repos/libraryRepo.js');

function apiRouter(deps) {

	let bodyParser;

	if(!deps.bodyParser) {
		throw new Error('[ apiCtrl ] Dependency Error: bodyParser is required');
	}

	bodyParser = deps.bodyParser;
	
	return {
		assignRoutes: function (router) {

			router.use(bodyParser.urlencoded({ extended: true }));
			router.use(bodyParser.json());

			router.get('/getlibrary', function (req, res, next) {
				res.status(200).json(libraries[0].getAllTracks());
				next();
			});

			router.post('/authTest', function(req, res, next) {

				//console.log(req.body.sharedKey);
			
				if (req.body.sharedKey === config.sharedKey) {
					res.status(202).end();
				} else {
					res.status(401).end();
				}
			
				next();
			
			});

			// log api requests to console
			router.use(function(req, res, next) {
				let time = new Date(Date.now());
				console.log('[ api    ](%s) %s %s', time.toJSON(), req.method, req.url);
			});
		}
	}
}

module.exports = apiRouter;