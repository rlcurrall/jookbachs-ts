
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

            // Get all tracks
            router.get('/track', function (req, res, next) {
                that.testDB.getLibrary().then(
                    function (lib) {
                        res.status(200).json(lib);
                        next();
                    },
                    function (err) {
                        res.status(400).json(err);
                        next();
                    }
                )
                next();
            })

            // Get track by id
            router.get('/track/:track_id', function (req, res, next) {
                console.log(req.params.track_id)
                let id = parseInt(req.params.track_id)
                that.testDB.getTrack({id: id}).then(
                    function (val) {
                        res.status(200).json(val);
                        next();
                    },
                    function (err) {
                        res.status(400).json(err);
                        next();
                    }
                )
                next();
            })

            // Get track by title
            router.get('/track/title/:track_title', function (req, res, next) {
                that.testDB.getTrack({title: req.params.track_title}).then(
                    function (val) {
                        res.status(200).json(val);
                        next();
                    },
                    function (err) {
                        res.status(400).json(err);
                        next();
                    }
                )
                next();
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