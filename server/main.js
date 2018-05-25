// import modules
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const express = require('express');
const socketIO = require('socket.io');
//const cluster = require('cluster');
const track = require('./utils/track');
const library = require('./utils/library');

// read in config/server.json
const config = JSON.parse(fs.readFileSync('server/config/server.json', 'utf8'));

// create new library objects for all elements in config
var libraryList = [];
config.libraryList.forEach(function (libraryElement) {
	libraryList.push(new library(libraryElement.path));
});

// initialize express
const expressApp = express();
const publicPath = path.join(__dirname, '..', '/public/');

// initialize express routers
const webuiRouter = express.Router();
const apiRouter = express.Router();

// connect the routers to their routes
expressApp.use('/', webuiRouter);
expressApp.use('/api', apiRouter);

/*webuiRouter.use(function(req, res, next) {
	console.log('[webui] %s %s', req.method, req.url);
	next();
});*/

// set static root directory for webui router
webuiRouter.use(express.static(publicPath));

// get listing of all playlists
apiRouter.get('/list_playlists', function(req, res, next) {

	res.json({
		'playlists': [
			{
				'name': 'casual'
			}
		]
	});

	next();

});

// list all tracks in the library
apiRouter.get('/list_all_library_tracks', function(req, res, next) {
	res.json(libraryList[0].getAllTracks());
	next();
});

// log api requests to console
apiRouter.use(function(req, res, next) {
	console.log('[ api ] %s %s', req.method, req.url);
});

// initialize server to listen on specified port
var server = expressApp.listen(config.webPort);

// initialize socket.io
var io = socketIO.listen(server);

io.on('connection', function(socket) {

	console.log('a user connected');

	socket.on('message', function(msg) {
		console.log('message: ' + msg);
	});

});

io.on('disconnect', function(socket) {
	console.log('a user disconnected');
});

// create http server for streaming
http.createServer(function (req, res) {

	// get requested file name from url
	var q = url.parse(req.url, true);
	var input = q.query;
	var filename;

	//console.log(input);

	try {
		filename = libraryList[0].tracksList[input.libraryIndex].path;
	} catch (e) {
		res.writeHead(404, {'Content-Type': 'text/html'});
		//console.log(e);
		var error = 'cannot access library index: ' + input.libraryIndex;
		console.log(error);
		return res.end(error);
	}

	//console.log(filename);

	let stat = fs.statSync(filename);

	fs.readFile(filename, function (err, data) {

		// if error reading file, return 404
		if (err) {
			res.writeHead(404, {'Content-Type': 'text/html'});
			//console.log(err);
			return res.end('404 Not Found: ' + filename);
		}

		// write response content type
		res.writeHead(200, {
			'Content-Length': stat.size,
			'Transfer-Encoding': 'chunked'
		});

		// create stream of file and send it to the response object
		fs.createReadStream(filename).pipe(res);

	});

}).listen(config.streamPort);
