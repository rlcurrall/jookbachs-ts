
function streamFactory (deps) {

    if (!deps.fs || !deps.url) {
        throw new Error('[ JbStream ] Missing Dependency: fs and url are required');
    }

    const fs = deps.fs;
    const url = deps.url;
    const JbRouter = require('JbRouter');

    class JbStream extends JbRouter {

        constructor (config, DB, options) {
            super(config, DB, options);
            this.url = '/stream';

            if (options) {
                // load options in
            }
        }

        assignRoute(router) {
            let that = this;

                router.use(function (req, res, next) {
                    that.log('JbStream', 'request', `${req.method} ${req.url}`);

                    // get requested file name from url
                    var q = url.parse(req.url, true);
                    var input = q.query;

                    input.id = parseInt(input.id);

                    that.DB.getTrack(input).then(
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