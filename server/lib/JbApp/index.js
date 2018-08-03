/**
 * @module JbApp
 * @author Robb Currall
 */

function appFactory (deps) {

    // #region Dependency Setup

    if (!deps.fs || !deps.http || !deps.express || !deps.bodyParser) {

    }

    // Declare Dependencies
    const fs = deps.fs;
    const http = deps.http;
    const https = deps.https;
    const express = deps.express;
    const MongoDB = deps.MongoDB;
    const bodyParser = deps.bodyParser;

    // Inject Dependencies
    const JbServer = require('./JbServer')({
        fs,
        http,
        https
    });
    const JbExpress = require('./JbExpress')({
        express,
        bodyParser
    });
    const JbDatabase = require('./JbDatabase')({
        MongoDB
    });

    // #endregion

    // Import Modules to be passed to main
    const JbRouter = require('./JbRouter');
    const JbSocket = require('./JbSocket');
    const JbAppManager = require('./JbAppManager');

    // Declare private objects
    const _logger = Symbol('Logger');
    const _db = Symbol('db');
    const _server = Symbol('server');
    const _express = Symbol('express');
    const _socket = Symbol('socket');
    const _routers = Symbol('routers');
    const _model = Symbol('model');
    const _dbmanager = Symbol('DbManager');

    // Declare private methods
    const _diff = Symbol('diff');
    const _log = Symbol('log');

    class JbApp {

        constructor(Routes, options) {
            let that = this;
            this[_routers] = Routes;
            
            if (options) {
                if (options.Logger)
                    this[_logger] = options.Logger;
                if (options.model)
                    this[_model] = options.model;
                if (options.DbManager)
                    this.DbManager = options.DbManager;
                if (options.Socket)
                    this.Socket = options.Socket;
                if (options.config.db)
                    this.DbConfig = options.config.db;
                if (options.config.server)
                    this.ServerConfig = options.config.server;
                if (options.config.app)
                    this.AppConfig = options.config.app;

                // Warn for unsupported options
                let unSup = that[_diff](Object.getOwnPropertyNames(options), ['Logger', 'model', 'DbManager', 'Socket', 'config']);
                unSup.forEach( (opt) => {
                    that[_log](`The [${opt}] option is not supported`, 'warn');
                });
            }

            if (this.DbConfig)
                this[_db] = new JbDatabase(this.DbConfig, { Logger: this[_logger] });
            
            if (this.DbManager)
                this[_dbmanager] = new this.DbManager(this[_db], { Logger: this[_logger], model: this[_model], config: this.AppConfig});
            
            this[_server] = new JbServer(this[_db], { Logger: this[_logger], config: this.ServerConfig });

            this[_express] = new JbExpress(this[_server], { Logger: this[_logger] });

            this[_socket] = new this.Socket(this[_server], { Logger: this[_logger] });

            this[_routers].forEach( Route => {
                new Route(this[_express], { Logger: this[_logger], DB: this[_db], config: this.AppConfig});
            })

            // // Can now load data into database with custom loader
            // // this will likely be passed to routers to allow for 
            // // 'admins' to perform updates to the database
            // setTimeout(() => {
            //     this[_dbmanager].dropAndReloadDB();
            // }, 5000);

            this[_log]('Application Started');

        }

        startApp() {

        }

        stopApp() {

        }

        [_diff](a, b) {
            return a.filter(function (i) {
                return b.indexOf(i) === -1;
            });
        }

        [_log](message, level, label) {
            if (this[_logger]) {
                if (label === undefined)
                    label = 'JbApp';
                if (level === undefined)
                    level = 'info';
                this[_logger].log({label, level, message});
            } else {
                console.log(message);
            }
        }
    }

    // Return and make object Immutable
    return Object.freeze({
        JbRouter,
        JbSocket,
        JbAppManager,
        JbApp
    });
}

module.exports = appFactory;