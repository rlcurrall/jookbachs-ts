/**
 * Factory for the JbApi class that injects all necessary dependencies.
 *
 * @param {object} deps
 * @returns
 */
function streamFactory (deps) {

    // #region Dependency Setup
    if (!deps.fs || !deps.url) {
        throw new Error('[ JbStream ] Missing Dependency: fs and url are required');
    }

    const fs = deps.fs;
    const url = deps.url;
    const JbRouter = require('JbRouter');
    // #endregion

    /**
     * Concrete implementation of the JbRouter class defining the /stream route.
     *
     * @class JbStream
     * @extends {JbRouter}
     */
    class JbStream extends JbRouter {

        /**
         * Creates an instance of JbStream.
         * @constructor
         * 
         * @param {object} config
         * @param {object} DB
         * @param {object} options
         * @memberof JbStream
         */
        constructor (config, DB, options) {
            super(config, DB, options);
            this.url = '/stream';

            if (options) {
                // load options in
            }
        }

        /**
         * Defines all responses for the JbStream router.
         *
         * @param {object} router
         * @memberof JbStream
         */
        assignRoute(router) {
            let that = this;

                router.use(function (req, res, next) {
                    that.log('JbStream', 'request', `${req.method} /stream${req.url}`);

                    // get requested file name from url
                    var q = url.parse(req.url, true);
                    var input = q.query;

                    input.id = parseInt(input.id);

                    that.DB.getRecord("tracks", input).then(
                        (track) => {
                            fs.createReadStream(track.path).pipe(res);
                        },
                        (err) => {
                            // send 404 code to indicate track not found
                            res.writeHead(404, {
                                'Content-Type': 'text/html'
                            });
            
                            // display error
                            var error = 'Cannot access library index: ' + input.id;
                            that.log('JbStream', 'info', error );
                            return res.end(error);
                        }
                    )
        
                });
                
                that.log('JbStream', 'info', 'Route Created');
        }
    }

    return JbStream;
}

module.exports = streamFactory;