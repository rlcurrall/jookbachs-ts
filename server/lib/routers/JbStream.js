/**
 * 
 * @param {*} deps 
 */
function streamRouter(deps) {

    // #region Dependency Setup

    let Logger = deps.Logger;
    let fs;
    let url;

    if (!deps.fs || !deps.url) {
        throw new Error('[ streamCtrl ] Missing Dependency: fs and url are required');
    }

    fs = deps.fs;
    url = deps.url;

    // #endregion

    class JbStream {
        /**
         * 
         * @param {*} config 
         * @param {*} DB 
         */
		constructor(config, DB) {
            this.DB = DB;
			this.url = '/stream';
		}

        /**
         * 
         * @param {*} router 
         */
		assignRoute(router) {
            let lib = this.DB;

			router.use(function (req, res, next) {

                // get requested file name from url
                var q = url.parse(req.url, true);
                var input = q.query;
                var filename;
    
                //
                try {
                    // get path from
                    filename = lib[0].tracksList[input.trackId].path;
                    Logger.log({label: 'Stream', level: 'request', message: `${req.method} ${req.url}`});
    
                } catch (e) {
    
                    // send 404 code to indicate track not found
                    res.writeHead(404, {
                        'Content-Type': 'text/html'
                    });
    
                    // display error
                    var error = 'Cannot access library index: ' + input.trackId;
                    Logger.log({label: 'JbStream', level: 'info', message: error });
                    return res.end(error);
    
                }
    
                // need to check if file can be read or not
                // create stream of file and send it to the response object
                fs.createReadStream(filename).pipe(res);
    
            });
            
            Logger.log({label: 'JbStream', level: 'info', message: 'Route Created'});
		}

        /**
         * 
         */
		getUrl() {
			return this.url;
		}
	}

	return JbStream;
}

module.exports = streamRouter;