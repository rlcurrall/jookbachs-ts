/**
 * @module JbApp
 * @author Robb Currall
 */

function appFactory (deps) {

    const fs = deps.fs;
    const http = deps.http;
    const https = deps.https;
    const express = deps.express;
    const MongoDB = deps.MongoDB;
    const bodyParser = deps.bodyParser;

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
    const JbRouter = require('./JbRouter');
    const JbSocket = require('./JbSocket');
    const JbAppManager = require('./JbAppManager');

    const _db = Symbol('db');
    const _server = Symbol('server');
    const _express = Symbol('express');
    const _socket = Symbol('socket');

    class JbApp {

        constructor(Routes, options) {
            this.Routes = Routes;
            
            if (options) {
                if (options.Logger)
                    this.Logger = options.Logger;
                if (options.config)
                    this.config = options.config;
                if (options.Socket)
                    this.Socket = options.Socket;
                if (options.DbConfig)
                    this.DbConfig = options.DbConfig;
                if (options.DataManager)
                    this.DataManager = options.DataManager;
                if (options.JbModel)
                    this.JbModel = options.JbModel;
            }

            this[_db] = new JbDatabase(this.config, { Logger: this.Logger, JbModel: this.JbModel, config: this.config });
            
            this[_server] = new JbServer(this[_db], { Logger: this.Logger, config: this.config });

            this[_express] = new JbExpress(this[_server], { Logger: this.Logger, config: this.config });

            this[_socket] = new this.Socket(this[_server], { Logger: this.Logger, config: this.config });

            Routes.forEach( Route => {
                new Route(this[_express], { Logger: this.Logger, DB: this[_db], config: this.config});
            })
        }
    }

    return {
        JbRouter,
        JbSocket,
        JbAppManager,
        JbApp
    }
}

module.exports = appFactory;