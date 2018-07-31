// ================================================================================================
// IMPORT MODULES & CONFIG INIT
// ================================================================================================

// #region Imports
// <editor-fold defaultstate="collapsed" desc="Imports">

const url = require('url');
const walk = require('walk');
const path = require('path');
const http = require('http');
const https = require('https');
const fs = require('fs-extra');
const Logger = require('Logger');
const express = require('express');
const MongoDB = require('mongodb');
const mm = require('music-metadata');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');

// Load config info
const user_config = JSON.parse(fs.readFileSync(process.env.USER_CONFIG, 'utf8')); // for user
const app_config = JSON.parse(fs.readFileSync(process.env.APP_CONFIG, 'utf-8')); // for dev
const config = Object.assign(user_config, app_config); // combine into one object
config.appDir = path.join(__dirname, '..'); // update config to have root dir of app

// </editor-fold>
// #endregion

// ================================================================================================
// DEPENDENCY INJECTION
// ================================================================================================

// #region DI
// <editor-fold defaultstate="collapsed" desc="DI">

// #region JbApp Dev Tools
const JbServer = require('JbApp').JbServer({
	fs,
	http,
	https,
	express
});
const JbDatabse = require('JbApp').JbDatabase({
	MongoDB
});
const JbRouter = require('JbApp').JbRouter;
const JbSocket = require('JbApp').JbSocket;
const JbAppManager = require('JbApp').JbAppManager;
// #endregion

// #region JbRouters
// <editor-fold desc="JbRouters">

const JbApi = require('JbApi')({
	JbRouter,
	bodyParser
});

const JbStream = require('JbStream')({
	JbRouter,
	fs,
	url
});

const JbWebUI = require('JbWebUI')({
	JbRouter,
	express
});

const JbScripts = require('JbScripts')({
	JbRouter,
	express
});

// </editor-fold>
// #endregion

const Socket = require('sockets/Socket')({
	JbSocket,
	socketIO
})

// #region DB
// <editor-fold desc="DB">

const JbTrack = require('models/JbTrack')({
	path,
	tagReader: mm
});

const DbManager = require('DbManager')({
	path,
	walk
})

// </editor-fold>
// #endregion

// </editor-fold>
// #endregion

// ================================================================================================
// INITIALIZATION
// ================================================================================================

Logger.log({ label: 'Main', level: 'info', message: 'Initializing Application' });

// ----------------------------
// Initialize DB Connection
// ----------------------------
const jbDatabase = new JbDatabse( 
	config, 		// configurations
	{ 				//options
		Logger,
		JbModel: JbTrack
	}
);
jbDatabase.connect();

// ----------------------------
// Create DbManager
// ----------------------------

// NOTE: this section may be removed later to be fed into a JbRouter
// 		 that will allow admins to drop DB, reload music, add in tracks,
//		 etc.
let dbManager = new DbManager(jbDatabase, JbTrack, config, {Logger});

setTimeout(() => { // wait for 5 seconds to ensure the DB is initialized fully
	dbManager.dropAndReloadDB();
}, 5000);

// ----------------------------
// Create Server
// ----------------------------
const jbServer = new JbServer( 
	jbDatabase, 			// Database
	[ 						// Routers
		JbWebUI, 
		JbScripts, 
		JbApi, 
		JbStream 
	], 
	{ 						// Options
		Logger,
		config,
		JbSocket: Socket
	} 
);
jbServer.startServer();

// ================================================================================================
// SHUTDOWN
// ================================================================================================

// Use .push() to add any extra functions
let shutdownFunctions = jbServer.getShutdownFunctions();

// Create Shutdown Manager (Currently only works on a few terminals... looking into other options. Though this feature is not necessary)
const SDM = new JbAppManager(shutdownFunctions, { Logger });