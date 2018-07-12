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

const { libraries } = require('repos/libraryRepo.js')({
	Logger: Logger,
	fs: fs,
	config: config,
	Track: Track,
	Library: Library
});

const { JbSocket } = require('services/socketFactory')({
	Logger: Logger,
	socketIO: socketIO
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

const { JbWebUI } = require('routers/webuiRouter.js')({
	Logger: Logger,
	express: express
});

const { JbScripts } = require('routers/scriptsRouter.js')({
	Logger: Logger,
	express: express
});

const { JbExpress } = require('services/expressFactory')({
	Logger: Logger,
	express: express
});

const { JbServer } = require('services/serverFactory')({
	Logger: Logger,
	fs: fs,
	http: http,
	https: https
});

const { ShutdownManager } = require('utils/ShutdownManager')({
	Logger: Logger,
	readline: readline
});

// #endregion

// ================================================================================================
// INITIALIZATION
// ================================================================================================

Logger.log({
	label: 'Main',
	level: 'info',
	message: 'Initializing Application'
});

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

const SDM = new ShutdownManager(jbServer);