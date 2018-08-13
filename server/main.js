// ================================================================================================
// IMPORT MODULES & CONFIG INIT
// ================================================================================================

// #region Imports

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
user_config.db = Object.assign(user_config.db, app_config.db); // unify db configs
const config = Object.assign(user_config, {app: Object.assign(app_config.app, {libraryPaths: user_config.libraryPaths})}); // combine into one object
config.app.rootDir = path.join(__dirname, '..'); // update config to have root dir of app

// cleanup
delete user_config;
delete app_config;

// #endregion

// ================================================================================================
// DEPENDENCY INJECTION
// ================================================================================================

// #region DI

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

// #endregion

const Socket = require('sockets/Socket')({
	JbSocket,
	socketIO
})

// #region DB

const JbTrack = require('models/JbTrack')({
	path,
	tagReader: mm
});

const DbManager = require('DbManager')({
	path,
	walk
})

// #endregion

// #endregion

// ================================================================================================
// INITIALIZATION
// ================================================================================================

// ----------------------------
// Create JbApp
// ----------------------------

let jbApp = new JbApp(
	[JbWebUI, JbScripts, JbStream, JbApi], 		// Array of JbRouters
	{
		Logger, 			// custom logger for app
		Socket, 			// JbScoket that
		config, 			// config
		model: JbTrack, 	// Model
		DbManager
	}
);
