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
const Logger = require('utils/logger');
const config = JSON.parse(fs.readFileSync(process.env.JSON_CONFIG, 'utf8'));
config.appDir = path.join(__dirname, '..'); // update config to have root dir of app

// #endregion

// ================================================================================================
// DEPENDENCY INJECTION
// ================================================================================================

// #region DI

const dbService = require('services/dbService')({
	Logger: Logger,
	MongoClient: MongoClient,
	config: config
});

const socketService = require('services/socketService')({
	Logger: Logger,
	socketIO: socketIO
});

const serverFactory = require('services/serverFactory')({
	Logger: Logger,
	fs: fs,
	http: http,
	https: https,
	config: config,
	socketService: socketService
})

const {
	track
} = require('services/trackService')({
	Logger: Logger,
	path: path,
	nodeID3: nodeID3
});

const {
	library
} = require('services/libraryService')({
	Logger: Logger,
	path: path,
	walk: walk,
	track: track
});

const {
	libraries
} = require('repos/libraryRepo.js')({
	Logger: Logger,
	fs: fs,
	config: config,
	track: track,
	library: library
});

const apiRouter = require('controllers/apiCtrl')({
	Logger: Logger,
	bodyParser: bodyParser,
	libraries: libraries
});

const streamRouter = require('controllers/streamCtrl')({
	Logger: Logger,
	fs: fs,
	url: url,
	libraries: libraries
});

const webuiRouter = require('controllers/webuiCtrl.js')({
	Logger: Logger,
	path: path,
	express: express,
	config: config
});

const scriptsRouter = require('controllers/scriptsCtrl.js')({
	Logger: Logger,
	path: path,
	express: express,
	config: config
});

const expressService = require('services/expressService')({
	Logger: Logger,
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