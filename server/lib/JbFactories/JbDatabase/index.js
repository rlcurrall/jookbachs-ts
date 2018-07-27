/**
 * @module JbDatabase
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
        throw new Error(`Missing Dependency: Logger, MongoClient, and config are required!`);
    }

    const ObjectId = deps.MongoDB.ObjectId;
    const MongoClient = deps.MongoDB.MongoClient;
    const path = deps.path;
    const walk = deps.walk;
    // </editor-fold>
    // #endregion

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
         * @param {object} JbModel
         * @param {object} options
         * @memberof JbDatabase
         */
        constructor(config, JbModel, options) {
            this.config = config;
            this.JbModel = JbModel;

            if (options) {
                if (options.Logger)
                    this.Logger = options.Logger;
            }

            this.dbURL = "mongodb://" + config.db.host + ":" + config.db.port + "/" + config.db.name;
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

            MongoClient.connect(this.dbURL, function (err, client) {
                if (err) {
                    that._log(`Unable to connect to database - ${that.dbURL}\n${err}`, 'error');
                }

                that._log('Database connected', 'info');

                that.client = client;
                that.db = client.db(that.config.db.name);

                that._dropAllCollections().then(
                    function (res) {
                        that._createAllCollections().then(
                            (res) => {
                                that._populateDB();
                            },
                            (err) => {
                                that._log(err, 'error');
                            }
                        );
                    },
                    function (err) {
                        that._log('Database already deleted', 'warn');
                        that._createAllCollections().then(
                            (res) => {
                                that._populateDB();
                            },
                            (err) => {
                                that._log(err, 'error');
                            }
                        );
                    }
                );
            });
        }

        
        /**
         * Close the connection to the database.
         *
         * @memberof JbDatabase
         */
        disconnect() {
            console.log('Disconnecting');
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

        /**
         * Get a single record from the specified collection that matches the 
         * provided query.
         *
         * @param {string} collection
         * @param {Object} query
         * @returns {Object}
         * @memberof JbDatabase
         */
        getRecord(collection, query) {
            if (query._id) {
                query._id = ObjectId(query._id)
            }
            return this.db.collection(collection).findOne(query).then(function (res) {
                return res
            }, function (err) {
                return err
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
        getRecordById(collection, id) {
            let query = {}
            query._id = ObjectId(id)
            return this.db.collection(collection).findOne(query).then(function (res) {
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
        getRecordsByQuery(collection, query, sort) {
            if (query.year)
                query.year = parseInt(query.year)

            if (typeof sort === 'undefined')
                sort = {"id": 1}

            return new Promise((resolve, reject) => {
                this.db.collection(collection).find(query).sort(sort).toArray(function (err, res) {
                    if (err) reject(err)
                    else resolve(res)
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
        getAllRecords(collection) {
            return new Promise((resolve, reject) => {
                this.db.collection(collection).find({}).sort({"id": 1}).toArray(function (err, res) {
                    if (err) reject(err)
                    else resolve(res)
                })
            })
        }
        
        // #endregion

        // #region Private functions

        
        /**
         * Drops all collections and documents of the collections defined in the config file.
         *
         * @private
         * @returns {Promise}
         * @memberof JbDatabase
         */
        _dropAllCollections() {
            let that = this

            return new Promise((funcRes, funcRej) => {
                let promises = []

                this.config.db.collections.forEach(c => {
                    promises.push(
                        new Promise((resolve, reject) => {
                            that.db.collection(c.name).drop(function (err, res) {
                                if (err) reject(err)
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
         * @private
         * @returns {Promise}
         * @memberof JbDatabase
         */
        _createAllCollections() {
            let that = this

            return new Promise((resolve, reject) => {
                that.config.db.collections.forEach(a => {
                    that.db.createCollection(a.name, { validator: { $jsonSchema: a.validator } } ).then(
                        (res) => {
                            resolve(res);
                            that._log(`${a.name} collection created`, 'info');
                        },
                        (err) => {
                            reject(err);
                        }
                    );
                });
            })
        }

        
        /**
         * Populates the database by traversing all file paths recursively from the config 
         * file and retrieving the metadata for each file to store in the database.
         * 
         * @private
         * @memberof JbDatabase
         */
        _populateDB() {
            let that = this;
            let fileTypeInclusions = ['.flac', '.m4a', '.mp3'];
            let Paths = this.config.libraryPaths;

            Paths.forEach( (library, index) => {
                let count = (1000000*index); // supports a max of 1,000,000 songs per library
                let dirPath = path.normalize(library);

                // setup walker for music library directory
                var walker = walk.walk(dirPath, {
                    followLinks: false
                });

                walker.on('file', function (root, stat, next) {

                    let included = fileTypeInclusions.find(function (element) {
                        return element === path.extname(stat.name);
                    });
                    let hidden = stat.name.substr(0, 1) === '.';

                    if (included && !hidden) {
                        let newTrack = new that.JbModel(count, root + path.sep + stat.name);
                        newTrack.loadMetaData().then(
                            (res) => {
                                that.insertRecord("tracks", newTrack.toJson());
                                count++;
                                next();
                            },
                            (err) => {
                                console.log("error " + err);
                            }
                        )
                    }
                    else {
                        next();
                    }

                });
            })

			
        }

        
        
        /**
         * Private Logger used by the JbDatabase class
         *
         * @param {string} msg
         * @param {string} [level]
         * @param {string} [label]
         * @memberof JbDatabase
         */
        _log(msg, level, label) {
            if (label === undefined)
                label = 'JbDatabase';
            if (this.Logger) {
                this.Logger.log({
                    label: label,
                    level: level,
                    message: msg
                });
            } else {
                console.log(msg);
            }
        }

        // #endregion
    }

    return JbDatabase;
}

module.exports = dbFactory;