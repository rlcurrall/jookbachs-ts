// ================================================================================================
// IMPORT MODULES & CONFIG
// ================================================================================================
const url = require('url');
const http = require('http');
const https = require('https');
const express = require('express');
const socketIO = require('socket.io');
const ss = require('socket.io-stream');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const path = require('path');
const walk = require('walk');
const nodeID3 = require('node-id3');
const config = JSON.parse(fs.readFileSync(process.env.JSON_CONFIG, 'utf8'));

// ================================================================================================
// DEPENDENCY INJECTION
// ================================================================================================
const track = require('services/trackService')({
	path: path,
	nodeID3: nodeID3
}).track;

const library = require('services/libraryService')({
	path: path,
	walk: walk,
	nodeID3: nodeID3,
	track: track
}).library;

const libraries = require('repos/libraryRepo.js')({
	fs: fs,
	config: config,
	track: track,
	library: library
}).libraries;

const apiRouter = require('controllers/apiCtrl')({
	bodyParser: bodyParser,
	libraries: libraries
});

const streamRouter = require('controllers/streamCtrl')({
	fs: fs,
	url: url,
	libraries: libraries
});

// ================================================================================================
// INITIALIZATION
// ================================================================================================

// define path to location of public (webui) files
const publicPath = path.join(__dirname, '..', '/public/');
const scriptPath = path.join(__dirname, '..', '/node_modules');

// TLS options
const tlsOptions = {
	key: fs.readFileSync(config.tlsOptions.keyPath),
	cert: fs.readFileSync(config.tlsOptions.crtPath)
};

var dbURL = "mongodb://" + config.db.host + ":" + config.db.port + "/";
var dbInitURL = dbURL + config.db.name;

MongoClient.connect(dbInitURL, function (err, db) {

	if (err) {
		console.log('unable to connect to database: ' + dbURL);
		console.log(err);
	}

	console.log("Database connected/created!");

	// console.log(db);
	/*var dbo = db.db(config.db.name);
	dbo.createCollection("tracks", function(err, res) {
		if (err) throw err;
		console.log("Collection created!");
		db.close();
	});*/

	db.close();

});

// ================================================================================================
// Express
// ================================================================================================

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

// set static root directory for webui router & script router
webui.use(express.static(publicPath));
scripts.use(express.static(scriptPath));

// Assign routes to routers
apiRouter.assignRoutes(api);
streamRouter.assignRoutes(stream);

var httpServer = http.createServer(function (req, res) {
	res.writeHead(301, {
		"Location": `https://${req.headers.host}${req.url}`
	});
	res.end();
}).listen(config.httpPort);

var tlsServer = https.createServer(tlsOptions, expressApp).listen(config.httpsPort);

// ================================================================================================
// Socket.IO
// ================================================================================================


// initialize socket.io
var io = socketIO.listen(tlsServer);

io.on('connect', function (socket) {

	console.log('connected');

	socket.on('join', function (params, callback) {

		socket.join(params.playerName);

	});

	socket.on('message', function (msg) {
		console.log('message: ' + msg);
	});

	socket.on('disconnect', function () {
		console.log('disconnected');
	});

});