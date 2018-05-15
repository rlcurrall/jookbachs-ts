// import node.js modules
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const express = require('express');
const socketIO = require('socket.io');

// define port numbers
const webuiPort = 8080;
const socketPort = 8081;
const apiPort = 8082;
const streamPort = 8083;

// get full path of public directory
const publicPath = path.join(__dirname, '..', '/public');

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

// have http server listen on port 4200
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

	//var stat = fs.statSync(filename);
	//console.log(stat);

	fs.readFile(filename, function (err, data) {

		// if error reading file, return 404
		if (err) {
			res.writeHead(404, {'Content-Type': 'text/html'});
			//console.log(err);
			return res.end('404 Not Found: ' + filename);
		}

		// write response content type
		res.writeHead(200, {  });

		// write response data
		res.write(data);

		// end response
		return res.end();
	});

// have http server listen on port 8080
}).listen(webuiPort);

// launch desktop app if run from NW.js
if (typeof nw !== 'undefined') {
	
	// Load library
	var gui = require('nw.gui');
	
	//var playerWindow = new gui.Window();
	
	var trayMenu = new gui.Menu();
	var openPlayerMenuItem = new gui.MenuItem({ label: 'Open player window' });
	var quitMenuItem = new gui.MenuItem({ label: 'Quit' });
	
	trayMenu.append(openPlayerMenuItem)
	trayMenu.append(quitMenuItem);

	// initialize tray icon
	var tray = new gui.Tray({ 
		icon: 'public/img/8th_note_white_100.png',
		title: 'jsAudioPlayer'
	});
	tray.menu = trayMenu;
	
	var playerWindow = gui.Window.open('http://localhost:' + webuiPort, {
		position: 'center',
		width: 1200,
		height: 700
	}, function(win) {
	//nw.Window.open('public/player.html', {}, function(win) {

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
	
}