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
const fs = require('fs');
const path = require('path');
const walk = require('walk');
const nodeID3 = require('node-id3');
const Logger = require('Logger');
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

const { libraries } = require('repos/libraryRepo')({
	Logger: Logger,
	fs: fs,
	config: config,
	Track: Track,
	Library: Library
});

const { JbApi } = require('routers/apiRouter')({
	Logger: Logger,
	bodyParser: bodyParser
});

const { JbStream } = require('routers/streamRouter')({
	Logger: Logger,
	fs: fs,
	url: url
});

const { JbWebUI } = require('routers/webuiRouter')({
	Logger: Logger,
	express: express
});

const { JbScripts } = require('routers/scriptsRouter')({
	Logger: Logger,
	express: express
});

const { JbExpress } = require('JbExpress')({
	Logger: Logger,
	express: express
});

const { JbSocket } = require('JbSocket')({
	Logger: Logger,
	socketIO: socketIO
});

const { JbServer } = require('JbServer')({
	Logger: Logger,
	fs: fs,
	http: http,
	https: https
});

const ShutdownManager = require('ShutdownManager');

// #endregion

// ================================================================================================
// INITIALIZATION
// ================================================================================================

Logger.log({ label: 'Main', level: 'info', message: 'Initializing Application' });

// Initialize DB
dbService.initDB();

// Initiallize Server
const jbServer = new JbServer(
	config, 		// Server configuration
	libraries, 		// DB instance (currently just has the array of libraries)
	JbSocket, 		// Socket Factory - Must implement constructor (1: http/https server)
	JbExpress, 		// Express Factory - Must implement constructor (0), getApp (0), and setRoute (1: router factory)
	[				// Router Factory Array - Must implement constructor (2: config, db instance), 
		JbWebUI, 	//						  assignRoute(1: express router), and getUrl (0)
		JbScripts, 
		JbApi, 
		JbStream
	]	
);

// ================================================================================================
// SHUTDOWN
// ================================================================================================

// Use .push() to add any extra functions
let shutdownFunctions = jbServer.getShutdownFunctions();

const SDM = new ShutdownManager(shutdownFunctions);
// SDM.setLogger(Logger);