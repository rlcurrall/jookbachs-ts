/**
 * 
 * @param {*} deps 
 */
function streamRouter(deps) {

    let Logger = deps.Logger;
    let fs;
    let url;
    let libraries;

    if (!deps.fs || !deps.url || !deps.libraries) {
        throw new Error('[ streamCtrl ] Missing Dependency: fs and url are required');
    }

    fs = deps.fs;
    url = deps.url;
    libraries = deps.libraries;

    /**
     * 
     * @param {*} router 
     */
    function assignRoutes(router) {

        router.use(function (req, res, next) {

            // get requested file name from url
            var q = url.parse(req.url, true);
            var input = q.query;
            var filename;

            //
            try {
                // get path from
                filename = libraries[0].tracksList[input.trackId].path;
                Logger.log({label: 'Stream', level: 'request', message: `${req.method} ${req.url}`});
                // console.log('[ stream ](%s) id=%s', time.toJSON(),
                //     libraries[0].tracksList[input.trackId].id);

            } catch (e) {

                // send 404 code to indicate track not found
                res.writeHead(404, {
                    'Content-Type': 'text/html'
                });

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

    return {
        assignRoutes: assignRoutes
    }
}

module.exports = streamRouter;