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
const MongoDB = require('mongodb');
const fs = require('fs-extra');
const path = require('path');
const walk = require('walk');
const mm = require('music-metadata');
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

// #region JbRouters
// <editor-fold desc="JbRouters">

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

const JbDatabse = require('JbDatabase')({
	MongoDB: MongoDB,
	path: path,
	walk: walk
});

const JbTrack = require('models/JbTrack')({
	path: path,
	tagReader: mm
});

// </editor-fold>
// #endregion

// </editor-fold>
// #endregion

// ================================================================================================
// INITIALIZATION
// ================================================================================================

Logger.log({ label: 'Main', level: 'info', message: 'Initializing Application' });

// Initialize DB Connection
const jbDatabase = new JbDatabse( config, JbTrack, { Logger: Logger } );
jbDatabase.connect();

// Create Server
const jbServer = new JbServer( config, jbDatabase, [ JbWebUI, JbScripts, JbApi, JbStream ], { Logger: Logger, db: jbDatabase } );
jbServer.startServer();

// ================================================================================================
// SHUTDOWN
// ================================================================================================

// NOTE: Leaving commented out for now as many terminals are not suported, may need to look into an
// alternate option or drop the feature as it is not necessary

// // Use .push() to add any extra functions
// let shutdownFunctions = jbServer.getShutdownFunctions();

// // Create Shutdown Manager (Currently only works on a few terminals... looking into other options. Though this feature is not necessary)
// const SDM = new ShutdownManager();
// SDM.setLogger(Logger);
// SDM.setShutdownFunctions(shutdownFunctions);