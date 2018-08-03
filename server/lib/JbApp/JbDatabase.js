/**
 * @module JbDatabase
 * @author Robb Currall {rlcurrall}
 */

/**
 * Factory for the JbDatabase class that injects all necessary dependencies.
 *
 * @param {object} deps
 * @returns
 */
function dbFactory(deps) {

    // #region Dependency Setup
    // <editor-fold desc="Dependency Setup">
    if (!deps.MongoDB) {
        throw new Error(`Missing Dependency: MongoDB is required!`);
    }

    const ObjectId = deps.MongoDB.ObjectId;
    const MongoClient = deps.MongoDB.MongoClient;
    // </editor-fold>
    // #endregion

    //Private functions/variables
    const _log = Symbol('log');
    const _diff = Symbol('diff');
    const _logger = Symbol('Logger');

    /**
     * Interface to the MongoDB database specified by the config file.
     *
     * @class JbDatabase
     */
    class JbDatabase {

        
        /**
         * Creates an instance of JbDatabase.
         * 
         * @param {object} config
         * @param {object} options
         * @memberof JbDatabase
         */
        constructor(config, options) {
            let that = this;
            
            // Load configurations
            if (!config || !config.name || !config.host || !config.port) {
                throw new Error('config is required');
            } else {
                this.config = config;
                this.dbName = config.name;
                this.dbURL = "mongodb://" + config.host + ":" + config.port + "/" + config.name;
                if (config.collections)
                    this.collections = config.collections;
            }

            // Load options
            if (options) {
                if (options.Logger)
                    this[_logger] = options.Logger;

                // Warn for unsupported options
                let unSup = this[_diff](Object.getOwnPropertyNames(options), ['Logger']);
                unSup.forEach( (opt) => {
                    that[_log](`The [${opt}] option is not supported`, 'warn');
                });
            }
        }

        
        /**
         * Create the connection to database and reinitialize the database by dropping all collections
         * specified by the config file, then creating the collections, and finally populating the 
         * collections.
         *
         * @memberof JbDatabase
         */
        connect() {
            let that = this;

            MongoClient.connect(this.dbURL, { useNewUrlParser: true}, function (err, client) {
                if (err) {
                    that[_log](`Unable to connect to database - ${that.dbURL}\n${err}`, 'error');
                    throw err;
                }

                that[_log]('Database connected');

                that.client = client;

                that.db = client.db(that.dbName);
            });
        }

        
        /**
         * Close the connection to the database.
         *
         * @memberof JbDatabase
         */
        disconnect() {
            [_log]('Disconnecting');
            this.client.close();
        }

        // #region DB Queries
        
        /**
         * Insert a record into the specified collection.
         *
         * @param {string} collection
         * @param {object} record
         * @returns {Promise}
         * @memberof JbDatabase
         */
        insertRecord(collection, record) {
            return new Promise((resolve, reject) => {
                this.db.collection(collection).insert(record, function (err, res) {
                    if (err) reject(err)
                    else resolve(res)
                })
            })
        }

        findOrCreate(collection, record) {
            // console.log(record);
        }

        /**
         * Get a single record from the specified collection that matches the 
         * provided query.
         *
         * @param {string} collection
         * @param {Object} query
         * @returns {Object}
         * @memberof JbDatabase
         */
        getOneRecord(collection, query, projection) {
            if (query._id)
                query._id = ObjectId(query._id);
            if (projection === undefined)
                projection = {};
                
            return new Promise( (resolve, reject) => {
                this.db.collection(collection).findOne(query, {fields: projection}).then(
                    function (res) {
                        resolve(res);
                    }, function (err) {
                        reject(err);
                    }
                );
            })
        }

        /**
         * Get a single record from the specified collection by the ObjectId provided.
         *
         * @param {string} collection
         * @param {string} id
         * @returns {Object}
         * @memberof JbDatabase
         */
        getRecordById(collection, id, projection) {
            // may convert to use cursor and toArray and return res[0]
            return this.db.collection(collection)
                .findOne({"_id" : ObjectId(id)}, {fields: projection})
                .then(function (res) {
                    return res
                }, function (err) {
                    return err
                })
        }

        /**
         * Get all records from the specified collection in the database that match
         * the query, sort by the provided sort paramaters, otherwise sort by the
         * 'id' property.
         *
         * @param {string} collection
         * @param {Object} query
         * @param {Object} sort
         * @returns {Promise}
         * @memberof JbDatabase
         */
        getRecordsByQuery(collection, query, options) {
            let sort = {};
            let projection = {};

            if (options) {
                if (options.sort)
                    sort = options.sort;
                if (options.projection)
                    projection = options.projection;
            }

            return new Promise((resolve, reject) => {
                this.db.collection(collection)
                    .find(query)
                    .sort(sort)
                    .project(projection)
                    .toArray(function (err, res) {
                        if (err) 
                            reject(err);
                        else
                            resolve(res);
                    })
            })
        }

        /**
         * Get all documents from the specified collection in the database and 
         * sort by the 'id' property.
         *
         * @param {string} collection
         * @returns {Promise}
         * @memberof JbDatabase
         */
        getAllRecords(collection, options) {
            let sort = {};
            let projection = {};
            if (options) {
                if (options.sort)
                    sort = options.sort;
                if (options.projection)
                    projection = options.projection;
            }
            return new Promise((resolve, reject) => {
                this.db.collection(collection)
                .find({})
                .sort(sort)
                .project(projection)
                .toArray(function (err, res) {
                    if (err) reject(err)
                    else resolve(res)
                })
            })
        }
        
        // #endregion

        /**
         * Drops all collections and documents of the collections defined in the config file.
         *
         * @returns {Promise}
         * @memberof JbDatabase
         */
        dropAllCollections() {
            let that = this

            return new Promise((funcRes, funcRej) => {
                let promises = []

                this.collections.forEach(c => {
                    promises.push(
                        new Promise((resolve, reject) => {
                            that.db.collection(c.name).drop(function (err, res) {
                                if (err) {
                                    if (err.code === 26) {
                                        that[_log](`${c.name.toUpperCase()} collection already deleted`, 'warn');
                                        reject(err);
                                    }
                                    else
                                        throw err;
                                }
                                else resolve(res)
                            })
                        })
                    )
                })

                Promise.all(promises).then(
                    (res) => {
                        funcRes(res)
                    },
                    (err) => {
                        funcRej(err)
                    }
                )
            })
        }

        
        /**
         * Creates all collections defined by the config file.
         *
         * @returns {Promise}
         * @memberof JbDatabase
         */
        createAllCollections() {
            let that = this

            return new Promise((resolve, reject) => {
                that.collections.forEach(a => {
                    that.db.createCollection(a.name, { validator: { $jsonSchema: a.$jsonSchema } } ).then(
                        (res) => {
                            resolve(res);
                            that[_log](`${a.name.toUpperCase()} collection created`);
                        },
                        (err) => {
                            reject(err);
                        }
                    );
                });
            })
        }

        // #region Private functions

        /**
         * Private function used to find the difference between two arrays
         * 
         * @param {array} a
         * @param {array} b
         * @memberof JbDatabase
         */
        [_diff](a, b) {
            return a.filter(function (i) {
                return b.indexOf(i) === -1;
            });
        }
        
        /**
         * Private Logger used by the JbDatabase class
         *
         * @param {string} message
         * @param {string} [level]
         * @param {string} [label]
         * @memberof JbDatabase
         */
        [_log](message, level, label) {
            if (label === undefined)
                label = 'JbDatabase';
            if (level === undefined)
                level = 'info';
            if (this[_logger]) {
                this[_logger].log({
                    label,
                    level,
                    message
                });
            } else {
                console.log(message);
            }
        }

        // #endregion
    }

    return JbDatabase;
}

module.exports = dbFactory;