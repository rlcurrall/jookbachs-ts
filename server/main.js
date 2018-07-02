// import modules
//const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');
//const os = require('os');
const express = require('express');
const bodyParser = require('body-parser');
const socketIO = require('socket.io');
const ss = require('socket.io-stream');
//const redir = require('redirect-https');
const mongo = require('mongodb');
//const cluster = require('cluster');
//const Greenlock = require('greenlock');

// define path to location of public (webui) files
const publicPath = path.join(__dirname, '..', '/public/');
const rootPath = path.join(__dirname, '..', '/');
const scriptPath = path.join(__dirname, '..', '/node_modules');

const track = require(rootPath + '/server/model/track');
const library = require(rootPath + '/server/model/library');

// read in config/server.json
const config = JSON.parse(fs.readFileSync('server/config/server.json', 'utf8'));

// TLS options
const tlsOptions = {
	key: fs.readFileSync(config.tlsOptions.keyPath),
	cert: fs.readFileSync(config.tlsOptions.crtPath)
};

// create new library objects for all elements in config
var libraries = [];
config.libraryPaths.forEach(function(libraryPath) {
	libraries.push(new library(libraryPath));
});

var dbURL = "mongodb://" + config.db.host + ":" + config.db.port + "/";
var dbInitURL = dbURL + config.db.name;

mongo.MongoClient.connect(dbInitURL, function(err, db) {

	if (err) {
		console.log('unable to connect to database: ' + dbURL);
		console.log(err);
	}

	console.log("Database connected/created!");

	//console.log(db);
	/*var dbo = db.db(config.db.name);
	dbo.createCollection("tracks", function(err, res) {
		if (err) throw err;
		console.log("Collection created!");
		db.close();
	});*/

	db.close();

});

/**************************************************************************************************
	Express
**************************************************************************************************/

// initialize express
const expressApp = express();

// initialize express routers
const webui = express.Router();
const api = express.Router();
const stream = express.Router();
const scripts = express.Router();

// connect the routers to their routes
expressApp.use('/', webui);
expressApp.use('/api', api);
expressApp.use('/stream', stream);
expressApp.use('/scripts', scripts);

// set static root directory for webui router
webui.use(express.static(publicPath));

// Set static directories for JS scripts
scripts.use(express.static(scriptPath));

// have api read in
api.use(bodyParser.urlencoded({
    extended: true
}));
api.use(bodyParser.json());

//===========================
// NOTE: I changed naming to
//		 closer match RESTful
//		 conventions
//===========================
api.get('/getlibrary', function(req, res, next) {
	res.status(200).json(libraryPaths[0].getAllTracks());
	next();
});

// list all tracks in the library
//===============================
// This Route is no longer used on the front end
api.get('/listAllLibraryTracks', function(req, res, next) {
	res.status(200).json(libraries[0].getAllTracks());
	next();
});

api.post('/authTest', function(req, res, next) {

	//console.log(req.body.sharedKey);

	if (req.body.sharedKey === config.sharedKey) {
		res.status(202).end();
	} else {
		res.status(401).end();
	}

	next();

});

// log api requests to console
api.use(function(req, res, next) {
	let time = new Date(Date.now());
	console.log('[ api    ](%s) %s %s', time.toJSON(), req.method, req.url);
});

stream.use(function(req, res, next) {

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

// initialize server to listen on specified port
//var server = expressApp.listen(config.webPort);
//http.createServer(greenlock.middleware(redir)).listen(config.webPort);
var tlsServer = https.createServer(tlsOptions, expressApp).listen(config.httpsPort);

/**************************************************************************************************
	Socket.IO
**************************************************************************************************/

// initialize socket.io
var io = socketIO.listen(tlsServer);

io.on('connect', function(socket) {

	console.log('connected');

	socket.on('join', function(params, callback) {

		socket.join(params.playerName);

	});

	socket.on('message', function(msg) {
		console.log('message: ' + msg);
	});

	socket.on('disconnect', function() {
		console.log('disconnected');
	});

});

/**************************************************************************************************
	NW.js
**************************************************************************************************

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
	icon: 'public/img/logo_dark_256.png',
	title: 'jsAudioPlayer'
});
tray.menu = trayMenu;

var playerWindow = gui.Window.open('https://localhost:8443', {
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

// const {app, BrowserWindow} = require('electron')
//
// function createWindow () {
//
// 	// Create the browser window.
// 	win = new BrowserWindow({width: 1200, height: 800})
//
// 	// and load the index.html of the app.
// 	// win.loadFile('public/index.html')
// 	win.loadURL('https://localhost:8443')
//
// 	win.webContents.openDevTools()
//
// }
//
// app.on('ready', createWindow)
*/
