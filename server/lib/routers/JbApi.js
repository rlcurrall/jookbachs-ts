
function apiFactory (deps) {

    if (!deps.bodyParser) {
		throw new Error('[ JbApi ] Missing Dependency: bodyParser is required');
	}

    const bodyParser = deps.bodyParser;
    const JbRouter = require('JbRouter');

    class JbApi extends JbRouter {

        constructor (config, DB, options) {
            super(config, DB, options);
            this.url = '/api';

            if (options) {
                if (options.db){
                    this.testDB = options.db;
                }
            }
        }

        assignRoute(router) {
            let lib = this.DB;
            let that = this;

            router.use(bodyParser.urlencoded({
                extended: true
            }));
            router.use(bodyParser.json());

            router.get('/test', function (req, res, next) {
                
            })

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