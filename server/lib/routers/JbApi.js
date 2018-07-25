function apiFactory(deps) {

    if (!deps.bodyParser) {
        throw new Error('[ JbApi ] Missing Dependency: bodyParser is required');
    }

    const bodyParser = deps.bodyParser;
    const JbRouter = require('JbRouter');

    class JbApi extends JbRouter {

        constructor(config, DB, options) {
            super(config, DB, options);
            this.url = '/api';

            if (options) {
                // load in options
            }
        }

        assignRoute(router) {
            let that = this;

            // #region Track Queries

            let getTrackById = function (req, res, next) {
                that.DB.getRecordById("tracks", req.params.id).then(
                    function (track) {
                        res.status(200).json(track)
                    },
                    function (err) {
                        res.status(400).json(err)
                    }
                )
            }

            let getAllTracks = function (req, res, next) {
                that.DB.getAllRecords("tracks").then(
                    function (lib) {
                        res.status(200).json(lib);
                    },
                    function (err) {
                        res.status(400).json(err);
                    }
                )
            }

            let getTracksByQuery = function (req, res, next) {
                let query = req.query;
                if (query.title || query.artist || query.album || query.year) {
                    that.DB.getRecordsByQuery("tracks", query).then(
                        function (val) {
                            res.status(200).json(val);
                        },
                        function (err) {
                            res.status(400).json(err);
                        }
                    )
                } else {
                    next();
                }
            }

            // #endregion

            // Route Initialization
            router.use(bodyParser.urlencoded({extended: true}));
            router.use(bodyParser.json());
            router.use(function (req, res, next) {
                that.log('JbApi', 'request', `${req.method} /api${req.url}`);
                next();
            });

            // Tracks Routes
            router.get('/tracks', getTracksByQuery, getAllTracks)
            router.get('/tracks/:id', getTrackById)

            that.log('JbApi', 'info', 'Route Created');
        }
    }

    return JbApi;
}

module.exports = apiFactory;