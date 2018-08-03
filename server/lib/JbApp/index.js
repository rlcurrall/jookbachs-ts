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

    // Declare private methods
    const _diff = Symbol('diff');

    class JbApp {

        constructor(Routes, options) {
            this[_routers] = Routes;
            
            if (options) {
                if (options.Logger)
                    this[_logger] = options.Logger;
                if (options.config)
                    this.config = options.config;
                if (options.Socket)
                    this.Socket = options.Socket;
                if (options.config.db)
                    this.DbConfig = options.config.db;
                if (options.config.server)
                    this.ServerConfig = options.config.server;
                if (options.config.router)
                    this.RouterConfig = options.config.router;
                if (options.DataManager)
                    this.DataManager = options.DataManager;
                if (options.JbModel)
                    this.JbModel = options.JbModel;
            }

            if (this.DbConfig)
                this[_db] = new JbDatabase(this.DbConfig, { Logger: this[_logger] });
            
            this[_server] = new JbServer(this[_db], { Logger: this[_logger], config: this.ServerConfig });

            this[_express] = new JbExpress(this[_server], { Logger: this[_logger] });

            this[_socket] = new this.Socket(this[_server], { Logger: this[_logger] });

            this[_routers].forEach( Route => {
                new Route(this[_express], { Logger: this[_logger], DB: this[_db], config: this.RouterConfig});
            })
        }

        startApp() {

        }

        stopApp() {

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