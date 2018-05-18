// import node.js modules
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// import npm modules
const express = require('express');
//const socketIO = require('socket.io');
//const cluster = require('cluster');

// import user defined modules
const track = require('./utils/track');
const library = require('./utils/library');

// initialize library object
const musicPath = "./music";
var musicLibrary = new library(musicPath);

// define port numbers
const webPort = 8080;
const streamPort = 8081;

// initialize express
const app = express();
const socketApp = express();
const publicPath = path.join(__dirname, '..', '/public/');

// initialize express routers
const webuiRouter = express.Router();
const apiRouter = express.Router();

// connect the routers to their routes
app.use('/', webuiRouter);
app.use('/api', apiRouter);

/*webuiRouter.use(function(req, res, next) {
	console.log('[webui] %s %s', req.method, req.url);
	next();
});*/

// set static root directory for webui router
webuiRouter.use(express.static(publicPath));

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

// handle api request
apiRouter.get('/list_all_library_track_paths', function(req, res, next) {
	
	var tracks = musicLibrary.getAllTracks();
	var trackPaths = [];
	
	for (var i = 0; i < tracks.length; i++) {
		trackPaths[i] = {'path': tracks[i].path};
	}
	
	res.json(trackPaths);
	
	next();
	
});

// log api requests to console
apiRouter.use(function(req, res, next) {
	console.log('[ api ] %s %s', req.method, req.url);
});

// initialize server to listen on specified port
var server = app.listen(webPort);

// initialize socket.io
var io = require('socket.io').listen(server);

io.on('connection', function(socket){
	
	console.log('a user connected');
	
	socket.on('message', function(msg){
		console.log('message: ' + msg);
	});
	
});

io.on('disconnect', function(socket){
	console.log('a user connected');
});

// create http server for streaming
http.createServer(function (req, res) {

	//console.log(req);

	// get requested file name from url
	var q = url.parse(req.url, true);
	var filename = '.' + q.pathname;

	filename = 'music/Ramble On.flac';
	//filename = 'music/08 The Ocean.mp3';
	let stat = fs.statSync(filename);

	//console.log(stat);

	fs.readFile(filename, function (err, data) {

		//console.log(data);

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

}).listen(streamPort);

/*const numCpus = require('os').cpus().length;
const threadLimit = 4;

// get full path of public directory
const publicPath = path.join(__dirname, '..', '/public');

// declare library object
const musicPath = "./music";
var musicLibrary;

if (cluster.isMaster) {
	
	// initialize music library
	musicLibrary = new library(musicPath);
	
	// limit number of threads to 4
	var numWorkers = numCpus < threadLimit ? numCpus : threadLimit;

    console.log('Master cluster setting up ' + numWorkers + ' workers...');

    for(var i = 0; i < numWorkers; i++) {
        cluster.fork();
    }

    cluster.on('online', function(worker) {
        console.log('Worker ' + worker.process.pid + ' is online');
    });

    cluster.on('exit', function(worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + 
			', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster.fork();
    });
	
} else {
	
	// configure middleware
	var app = express();
	app.use(express.static(publicPath));

	// initialize socket server
	var io = socketIO(http.createServer(app).listen(socketPort));

	io.on('connection', (socket) => {

		console.log('new socket connection');

		socket.on('join', (params, callback) => {
			console.log(params);
			callback();
		});

		socket.on('disconnect', (params, callback) => {
			console.log(params);
			callback();
		});

	});

	// create http server for streaming
	http.createServer(function (req, res) {

		//console.log(req);

		// get requested file name from url
		var q = url.parse(req.url, true);
		var filename = '.' + q.pathname;

		filename = 'music/Ramble On.flac';
		//filename = 'music/08 The Ocean.mp3';
		let stat = fs.statSync(filename);

		//console.log(stat);

		fs.readFile(filename, function (err, data) {

			//console.log(data);

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

	}).listen(streamPort);

	// create http server for webui
	http.createServer(function (req, res) {

		//console.log(req);

		// get requested file name from url
		var q = url.parse(req.url, true);
		var filename = '.' + q.pathname;

		if (filename === './') {
			filename = 'public/player.html';
		}

		fs.readFile(filename, function (err, data) {

			// if error reading file, return 404
			if (err) {
				res.writeHead(404, {'Content-Type': 'text/html'});
				//console.log(err);
				return res.end('404 Not Found: ' + filename);
			}

			// write response content type
			res.writeHead(200, {});

			// write response data
			res.write(data);

			// end response
			return res.end();

		});

	}).listen(webuiPort);

	// create http server for api
	http.createServer(function (req, res) {

		console.log(req);
		
		// write response content type
		res.writeHead(200, {'Content-Type': 'text/json'});

		// write response data
		res.write(JSON.stringify({'test-response': 'ok'}));

		// end response
		return res.end();

	}).listen(apiPort);
	
}

// nw.js doesn't launch when user-defined modules are used, disabled for now

// launch desktop app if run from NW.js
if (typeof nw !== 'undefined') {
	
	// Load library
	var gui = require('nw.gui');
	
	//var playerWindow = new gui.Window();
	
	var trayMenu = new gui.Menu();
	var openPlayerMenuItem = new gui.MenuItem({ label: 'Open player window' });
	var quitMenuItem = new gui.MenuItem({ label: 'Quit' });
	
	trayMenu.append(openPlayerMenuItem);
	trayMenu.append(quitMenuItem);

	// initialize tray icon
	var tray = new gui.Tray({ 
		icon: 'public/img/logo_dark_256.png',
		title: 'jsAudioPlayer'
	});
	tray.menu = trayMenu;
	
	var playerWindow = gui.Window.open('http://localhost:' + webuiPort, {
		position: 'center',
		width: 1200,
		height: 800
	}, function(win) {

		// Get the close event
		win.on('close', function() {

			// Hide window
			this.hide();

			// Show window on left click
			tray.on('click', function() {
				win.show();
			});
			
			// show window by clicking the "open player window" menu item
			openPlayerMenuItem.click = function() {
				win.show();
			};

		});

	});
	
	quitMenuItem.click = function() {
		process.exit();
	};
	
}*/