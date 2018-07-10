// ================================================================================================
// IMPORT MODULES & CONFIG INIT
// ================================================================================================

// #region Imports

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
config.appDir = path.join(__dirname, '..'); // update config to have root dir of app

// #endregion

// ================================================================================================
// DEPENDENCY INJECTION
// ================================================================================================

// #region DI

const dbService = require('services/dbService')({
	MongoClient: MongoClient,
	config: config
});

const socketService = require('services/socketService')({
	socketIO: socketIO
});

const serverFactory = require('services/serverFactory')({
	fs: fs,
	http: http,
	https: https,
	config: config,
	socketService: socketService
})

const {
	track
} = require('services/trackService')({
	path: path,
	nodeID3: nodeID3
});

const {
	library
} = require('services/libraryService')({
	path: path,
	walk: walk,
	track: track
});

const {
	libraries
} = require('repos/libraryRepo.js')({
	fs: fs,
	config: config,
	track: track,
	library: library
});

const apiRouter = require('controllers/apiCtrl')({
	bodyParser: bodyParser,
	libraries: libraries
});

const streamRouter = require('controllers/streamCtrl')({
	fs: fs,
	url: url,
	libraries: libraries
});

const webuiRouter = require('controllers/webuiCtrl.js')({
	path: path,
	express: express,
	config: config
});

const scriptsRouter = require('controllers/scriptsCtrl.js')({
	path: path,
	express: express,
	config: config
});

const expressService = require('services/expressService')({
	express: express,
	webuiRouter: webuiRouter,
	scriptsRouter: scriptsRouter,
	apiRouter: apiRouter,
	streamRouter: streamRouter
});

// #endregion

// ================================================================================================
// INITIALIZATION
// ================================================================================================

// Initialize DB
dbService.initDB();

// Initialize Express App
const expressApp = expressService.createApp();

// Initiallize Server
serverFactory.createServer(expressApp);