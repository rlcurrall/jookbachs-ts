
function apiFactory (deps) {

    if (!deps.bodyParser) {
		throw new Error('[ JbApi ] Missing Dependency: bodyParser is required');
	}

    const bodyParser = deps.bodyParser;
    const JbRouter = require('JbRouter');

    class JbApi extends JbRouter {

        constructor (config, DB) {
            super(config, DB);
            this.url = '/api';
        }

        assignRoute(router) {
            let lib = this.DB;
            let that = this;

            router.use(bodyParser.urlencoded({
                extended: true
            }));
            router.use(bodyParser.json());

            router.get('/getlibrary', function (req, res, next) {
                res.status(200).json(lib[0].getAllTracks());
                next();
            })

            router.post('/authTest', function(req, res, next) {
                if (req.body.sharedKey === config.sharedKey) {
                    res.status(202).end();
                } else {
                    res.status(401).end();
                }

                next();
            });

            router.use(function (req, res, next) {
                that.log('JbApi', 'request', `${req.method} ${req.url}`);
            });

            
            that.log('JbApi', 'info', 'Route Created');
        }
    }

    return JbApi;
}

module.exports = apiFactory;