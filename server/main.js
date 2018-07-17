// ================================================================================================
// IMPORT MODULES & CONFIG INIT
// ================================================================================================

// #region Imports
// <editor-fold defaultstate="collapsed" desc="Imports">

const url = require('url');
const http = require('http');
const https = require('https');
const express = require('express');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const path = require('path');
const walk = require('walk');
const nodeID3 = require('node-id3');
const Logger = require('Logger');
const ShutdownManager = require('ShutdownManager');
const config = JSON.parse(fs.readFileSync(process.env.JSON_CONFIG, 'utf8'));
config.appDir = path.join(__dirname, '..'); // update config to have root dir of app

// </editor-fold>
// #endregion

// ================================================================================================
// DEPENDENCY INJECTION
// ================================================================================================

// #region DI
// <editor-fold defaultstate="collapsed" desc="DI">

const JbServer = require('JbServer')({
	fs: fs,
	http: http,
	https: https,
	socketIO: socketIO,
	express: express
});

// #region Routers
// <editor-fold desc="Routers">

const JbApi = require('JbApi')({
	bodyParser: bodyParser
});

const JbStream = require('JbStream')({
	fs: fs,
	url: url
});

const JbWebUI = require('JbWebUI')({
	express: express
});

const JbScripts = require('JbScripts')({
	express: express
});

// </editor-fold>
// #endregion

// #region DB
// <editor-fold desc="DB">

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

// </editor-fold>
// #endregion

// </editor-fold>
// #endregion

// ================================================================================================
// INITIALIZATION
// ================================================================================================

Logger.log({ label: 'Main', level: 'info', message: 'Initializing Application' });

// Initialize DB
dbService.initDB();

// Create Server
const jbServer = new JbServer( config, libraries, [ JbWebUI, JbScripts, JbApi, JbStream ] );

jbServer.setLogger(Logger);
jbServer.startServer();

// ================================================================================================
// SHUTDOWN
// ================================================================================================

// Use .push() to add any extra functions
let shutdownFunctions = jbServer.getShutdownFunctions();

const SDM = new ShutdownManager();

SDM.setLogger(Logger);
SDM.setShutdownFunctions(shutdownFunctions);