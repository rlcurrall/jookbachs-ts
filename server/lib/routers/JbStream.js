
function streamFactory (deps) {

    if (!deps.fs || !deps.url) {
        throw new Error('[ JbStream ] Missing Dependency: fs and url are required');
    }

    const fs = deps.fs;
    const url = deps.url;
    const JbRouter = require('JbRouter');

    class JbStream extends JbRouter {

        constructor (config, DB) {
            super(config, DB);
            this.url = '/stream';
        }

        assignRoute(router) {
            let lib = this.DB;
            let that = this;

                router.use(function (req, res, next) {

                    // get requested file name from url
                    var q = url.parse(req.url, true);
                    var input = q.query;
                    var filename;
        
                    //
                    try {
                        // get path from
                        filename = lib[0].tracksList[input.trackId].path;
                        that.log('JbStream', 'request', `${req.method} ${req.url}`);
        
                    } catch (e) {
        
                        // send 404 code to indicate track not found
                        res.writeHead(404, {
                            'Content-Type': 'text/html'
                        });
        
                        // display error
                        var error = 'Cannot access library index: ' + input.trackId;
                        that.log('JbStream', 'info', error );
                        return res.end(error);
        
                    }
        
                    // need to check if file can be read or not
                    // create stream of file and send it to the response object
                    fs.createReadStream(filename).pipe(res);
        
                });
                
                that.log('JbStream', 'info', 'Route Created');
        }
    }

    return JbStream;
}

module.exports = streamFactory;