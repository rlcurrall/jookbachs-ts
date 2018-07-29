/**
 * Factory for the JbApi class that injects all necessary dependencies.
 *
 * @param {object} deps
 * @returns
 */
function apiFactory(deps) {

    // #region Dependency Setup
    if (!deps.bodyParser) {
        throw new Error('[ JbApi ] Missing Dependency: bodyParser is required');
    }

    const bodyParser = deps.bodyParser;
    const JbRouter = deps.JbRouter;
    // #endregion

    /**
     * Concrete Implementation of the JbRoute class defining the /api route.
     *
     * @class JbApi
     * @extends {JbRouter}
     */
    class JbApi extends JbRouter {

        /**
         * Creates an instance of JbApi.
         * @constructor
         * 
         * @param {object} config
         * @param {object} DB
         * @param {object} options
         * @memberof JbApi
         */
        constructor(DB, options) {
            super(DB, options);
            this.url = '/api';

            if (options) {
                // load in options
            }
        }

        /**
         * Defines all responses for the JbApi router.
         *
         * @param {object} router
         * @memberof JbApi
         */
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
                that.DB.getAllRecords("tracks", {sort: {'id': 1}}).then(
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
                if (query.year)
                    query.year = parseInt(query.year);
                if (query.title || query.artist || query.album || query.year) {
                    that.DB.getRecordsByQuery("tracks", query, {sort: {'id': 1}}).then(
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
                that.log( `${req.method} /api${req.url}`, 'request', 'JbApi' );
                next();
            });

            // Tracks Routes
            router.get('/tracks', getTracksByQuery, getAllTracks)
            router.get('/tracks/:id', getTrackById)

            that.log( 'Route Created', 'info', 'JbApi' );
        }
    }

    return JbApi;
}

module.exports = apiFactory;