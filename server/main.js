// import node.js modules
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// import npm modules
const express = require('express');
const socketIO = require('socket.io');
//const cluster = require('cluster');

// import user defined modules
const track = require('./utils/track');
const library = require('./utils/library');

// initialize library object
//var musicLibrary = new library('C:\\Users\\sweylo\\Desktop\\jsaudiotest\\music');
var musicLibrary = new library('E:\\music library');

// define port numbers
const webPort = 8080;
const streamPort = 8081;

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
	res.json(musicLibrary.getAllTracks());
	next();
});

// log api requests to console
apiRouter.use(function(req, res, next) {
	console.log('[ api ] %s %s', req.method, req.url);
});

// initialize server to listen on specified port
var server = expressApp.listen(webPort);

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
		filename = musicLibrary.tracksList[input.libraryIndex].path;
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

}).listen(streamPort);

if (process.argv[2] === '-gui') {

	/*
		code from main.js of electron-quick-start 
	*/

	const electron = require('electron')
	// Module to control application life.
	const app = electron.app
	// Module to create native browser window.
	const BrowserWindow = electron.BrowserWindow

	// Keep a global reference of the window object, if you don't, the window will
	// be closed automatically when the JavaScript object is garbage collected.
	let mainWindow

	function createWindow () {
	  // Create the browser window.
	  mainWindow = new BrowserWindow({width: 800, height: 600})

	  // and load the index.html of the app.
	  mainWindow.loadURL('http://localhost:8080')

	  // Open the DevTools.
	  // mainWindow.webContents.openDevTools()

	  // Emitted when the window is closed.
	  mainWindow.on('closed', function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null
	  })
	}

	// This method will be called when Electron has finished
	// initialization and is ready to create browser windows.
	// Some APIs can only be used after this event occurs.
	app.on('ready', createWindow)

	// Quit when all windows are closed.
	app.on('window-all-closed', function () {
	  // On OS X it is common for applications and their menu bar
	  // to stay active until the user quits explicitly with Cmd + Q
	  if (process.platform !== 'darwin') {
		app.quit()
	  }
	})

	app.on('activate', function () {
	  // On OS X it's common to re-create a window in the app when the
	  // dock icon is clicked and there are no other windows open.
	  if (mainWindow === null) {
		createWindow()
	  }
	})

	// In this file you can include the rest of your app's specific main process
	// code. You can also put them in separate files and require them here.


}
