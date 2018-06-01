// import modules
const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');
const express = require('express');
const socketIO = require('socket.io');
//const mongo = require('mongodb');
//const cluster = require('cluster');
const track = require('./utils/track');
const library = require('./utils/library');

// read in config/server.json
const config = JSON.parse(fs.readFileSync('server/config/server.json', 'utf8'));

// define path to location of public (webui) files
const publicPath = path.join(__dirname, '..', '/public/');

// SSL options
const sslOptions = {
	key: fs.readFileSync(config.ssl.keyPath),
	cert: fs.readFileSync(config.ssl.crtPath)
}

// create new library objects for all elements in config
var libraryPaths = [];
config.libraryPaths.forEach(function (libraryPath) {
	libraryPaths.push(new library(libraryPath));
});

/**************************************************************************************************
	Express
**************************************************************************************************/

// initialize express
const expressApp = express();

// initialize express routers
const webuiRouter = express.Router();
const apiRouter = express.Router();
const streamRouter = express.Router();

// connect the routers to their routes
expressApp.use('/', webuiRouter);
expressApp.use('/api', apiRouter);
expressApp.use('/stream', streamRouter);

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
	res.json(libraryPaths[0].getAllTracks());
	next();
});

// log api requests to console
apiRouter.use(function(req, res, next) {
	let time = new Date(Date.now());
	console.log('[ api ](%s) %s %s', time.toJSON(), req.method, req.url);
});

streamRouter.use(function(req, res, next) {

	// get requested file name from url
	var q = url.parse(req.url, true);
	var input = q.query;
	var filename;

	//console.log(input);

	try {

		filename = libraryPaths[0].tracksList[input.libraryIndex].path;
		console.log(libraryPaths[0].tracksList[input.libraryIndex]);

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

});

// initialize server to listen on specified port
var server = expressApp.listen(config.webPort);
var sslServer = https.createServer(sslOptions, expressApp).listen(8443);

/**************************************************************************************************
	Socket.IO
**************************************************************************************************/

// initialize socket.io
var io = socketIO.listen(sslServer);

io.on('connection', function(socket) {

	//console.log('a user connected');

	socket.on('message', function(msg) {
		console.log('message: ' + msg);
	});

});

io.on('disconnect', function(socket) {
	console.log('a user disconnected');
});

/**************************************************************************************************
	Streaming server
**************************************************************************************************/

/*// create http server for streaming
http.createServer(function (req, res) {

	// get requested file name from url
	var q = url.parse(req.url, true);
	var input = q.query;
	var filename;

	//console.log(input);

	try {

		filename = libraryPaths[0].tracksList[input.libraryIndex].path;
		console.log(libraryPaths[0].tracksList[input.libraryIndex]);

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

}).listen(config.streamPort);*/
