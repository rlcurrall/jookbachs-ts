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
user_config.db = Object.assign(user_config.db, app_config.db);
const config = Object.assign(user_config, {router: app_config.router}); // combine into one object
config.router.appDir = path.join(__dirname, '..'); // update config to have root dir of app

// cleanup
delete user_config;
delete app_config;

// </editor-fold>
// #endregion

// ================================================================================================
// DEPENDENCY INJECTION
// ================================================================================================

// #region DI
// <editor-fold defaultstate="collapsed" desc="DI">

// #region JbApp Dev Tools
const { JbApp, JbRouter, JbSocket, JbAppManager} = require('JbApp')({
	fs,
	http,
	https,
	express,
	MongoDB,
	bodyParser
});
// #endregion

// #region JbRouters
// <editor-fold desc="JbRouters">

const JbApi = require('JbApi')({
	JbRouter
});

const JbStream = require('JbStream')({
	JbRouter,
	fs,
	url
});

const JbWebUI = require('JbWebUI')({
	JbRouter
});

const JbScripts = require('JbScripts')({
	JbRouter
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
// Create DbManager
// ----------------------------

// NOTE: this section may be removed later to be fed into a JbRouter
// 		 that will allow admins to drop DB, reload music, add in tracks,
//		 etc.
// let dbManager = new DbManager(jbDatabase, JbTrack, config, {Logger});

// setTimeout(() => { // wait for 5 seconds to ensure the DB is initialized fully
// 	dbManager.dropAndReloadDB();
// }, 5000);

let jbApp = new JbApp(
	[JbWebUI, JbScripts, JbStream, JbApi], 		// Array of JbRouters
	{ 
		Logger, 			// custom logger for app
		Socket, 			// JbScoket that 
		config, 			// config
		JbModel: JbTrack 
	}
);

// ================================================================================================
// SHUTDOWN
// ================================================================================================

// Use .push() to add any extra functions
// let shutdownFunctions = jbServer.getShutdownFunctions();

// Create Shutdown Manager (Currently only works on a few terminals... looking into other options. Though this feature is not necessary)
// const SDM = new JbAppManager(shutdownFunctions, { Logger });