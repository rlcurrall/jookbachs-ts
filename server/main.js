// ================================================================================================
// IMPORT MODULES & CONFIG INIT
// ================================================================================================

// #region Imports

const q = require('q');
const url = require('url');
const http = require('http');
const https = require('https');
const express = require('express');
const socketIO = require('socket.io');
const ss = require('socket.io-stream');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const walk = require('walk');
const nodeID3 = require('node-id3');
const Logger = require('utils/Logger');
const config = JSON.parse(fs.readFileSync(process.env.JSON_CONFIG, 'utf8'));
config.appDir = path.join(__dirname, '..'); // update config to have root dir of app

// #endregion

// ================================================================================================
// DEPENDENCY INJECTION
// ================================================================================================

// #region DI

const {ShutdownManager} = require('utils/ShutdownManager')({ 
	Logger: Logger, 
	readline: readline 
});

const dbService = require('services/dbService')({
	Logger: Logger,
	MongoClient: MongoClient,
	config: config
});

const {Socket} = require('services/socketService')({
	Logger: Logger,
	socketIO: socketIO
});

const { Track } = require('models/trackModel')({
	Logger: Logger,
	path: path,
	nodeID3: nodeID3
});

const { Library } = require('models/libraryModel')({
	Logger: Logger,
	path: path,
	walk: walk,
	track: Track
});

const { libraries } = require('repos/libraryRepo.js')({
	Logger: Logger,
	fs: fs,
	config: config,
	Track: Track,
	Library: Library
});

const apiRouter = require('routers/apiRouter')({
	Logger: Logger,
	bodyParser: bodyParser,
	libraries: libraries
});

const streamRouter = require('routers/streamRouter')({
	Logger: Logger,
	fs: fs,
	url: url,
	libraries: libraries
});

const webuiRouter = require('routers/webuiRouter.js')({
	Logger: Logger,
	path: path,
	express: express,
	config: config
});

const scriptsRouter = require('routers/scriptsRouter.js')({
	Logger: Logger,
	path: path,
	express: express,
	config: config
});

const {ExpressApp} = require('services/expressService')({
	Logger: Logger,
	express: express,
	webuiRouter: webuiRouter,
	scriptsRouter: scriptsRouter,
	apiRouter: apiRouter,
	streamRouter: streamRouter
});

const {Server} = require('services/serverFactory')({
	Logger: Logger,
	fs: fs,
	http: http,
	https: https,
	config: config,
	Socket: Socket,
	ExpressApp: ExpressApp
})

// #endregion

// ================================================================================================
// INITIALIZATION
// ================================================================================================

// Initialize DB
dbService.initDB();

// Initiallize Server
// serverFactory.createServer();
const serverBndl = new Server();

// ================================================================================================
// SHUTDOWN
// ================================================================================================

const SDM = new ShutdownManager();
