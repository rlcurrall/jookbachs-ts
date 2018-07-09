
const libraries = require('repos/libraryRepo.js');

function streamRouter(deps) {

    let fs;
    let url;

	if(!deps.fs || !deps.url) {
		throw new Error('[ streamCtrl ] Dependency Error: fs and url are required');
	}

	fs = deps.fs;
	url = deps.url;
	
	return {
		assignRoutes: function (router) {

			router.use(function(req, res, next) {

                // get requested file name from url
                var q = url.parse(req.url, true);
                var input = q.query;
                var filename;
            
                //
                try {
            
                    // get current time
                    let time = new Date(Date.now());
            
                    // get path from
                    filename = libraries[0].tracksList[input.trackId].path;
                    console.log('[ stream ](%s) id=%s', time.toJSON(),
                        libraries[0].tracksList[input.trackId].id);
            
                } catch (e) {
            
                    // send 404 code to indicate track not found
                    res.writeHead(404, {'Content-Type': 'text/html'});
            
                    // display error
                    var error = 'cannot access library index: ' + input.trackId;
                    console.log(error);
                    return res.end(error);
            
                }
            
                // need to check if file can be read or not
                // create stream of file and send it to the response object
                fs.createReadStream(filename).pipe(res);
            
            });
		}
	}
}

module.exports = streamRouter;