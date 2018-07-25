/**
 * 
 * @param {*} deps 
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

    class JbDatabase {

        /**
         * 
         * @param {*} config 
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
         * Create connection to database, if the necessary collections do not exist
         * then create the collections.
         */
        connect() {
            let that = this;

            MongoClient.connect(this.dbURL, function (err, client) {
                if (err) {
                    that._log('DbService', 'error', `Unable to connect to database - ${that.dbURL}\n${err}`);
                }

                that._log('DbService', 'info', 'Database connected');

                that.client = client;
                that.db = client.db(that.config.db.name);

                that._dropAllCollections().then(
                    function (res) {
                        that._createAllCollections().then(
                            (res) => {
                                that._populateDB();
                            },
                            (err) => {
                                that._log('JbDatabase', 'error', err);
                            }
                        );
                    },
                    function (err) {
                        that._log('JbDatabase', 'warn', 'Database already deleted');
                        that._createAllCollections().then(
                            (res) => {
                                that._populateDB();
                            },
                            (err) => {
                                that._log('JbDatabase', 'error', err);
                            }
                        );
                    }
                );
            });
        }

        /**
         * Close connection to the database
         */
        disconnect() {
            console.log('Disconnecting');
            this.client.close();
        }

        // #region DB Queries

        /**
         * 
         * @param {*} collection 
         * @param {*} record 
         */
        insertRecord(collection, record) {
            return new Promise((resolve, reject) => {
                this.db.collection(collection).insert(record, function (err, res) {
                    if (err) reject(err)
                    else resolve(res)
                })
            })
        }

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

        getRecordById(collection, id) {
            let query = {}
            query._id = ObjectId(id)
            return this.db.collection(collection).findOne(query).then(function (res) {
                return res
            }, function (err) {
                return err
            })
        }

        getRecordsByQuery(collection, query) {
            if (query.year) {
                query.year = parseInt(query.year)
            }
            return new Promise((resolve, reject) => {
                this.db.collection(collection).find(query).toArray(function (err, res) {
                    if (err) reject(err)
                    else resolve(res)
                })
            })
        }

        getAllRecords(collection) {
            return new Promise((resolve, reject) => {
                this.db.collection(collection).find({}).toArray(function (err, res) {
                    res.sort((a, b) => a.id - b.id) // ensure that tracks are ordered by Id
                    if (err) reject(err)
                    else resolve(res)
                })
            })
        }
        
        // #endregion

        // #region Private functions

        /**
         * 
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
         * 
         */
        _createAllCollections() {
            let that = this

            return new Promise((resolve, reject) => {
                that.config.db.collections.forEach(a => {
                    that.db.createCollection(a.name, { validator: { $jsonSchema: a.validator } } ).then(
                        (res) => {
                            resolve(res);
                            that._log('DbService', 'info', `${a.name} collection created`);
                        },
                        (err) => {
                            reject(err);
                        }
                    );
                });
            })
        }

        /**
         * 
         */
        _populateDB() {
            let that = this;
            let fileTypeInclusions = ['.flac', '.m4a', '.mp3'];
			let dirPath = path.normalize(this.config.libraryPaths[0]);
			let count = 0;

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
                            // console.log(newTrack)
                            that.insertRecord("tracks", newTrack.toJson())
							count++;
							next();
						},
						(err) => {
							console.log("error " + err)
						}
					)
				}
				else {
					next();
				}

			});
        }

        /**
         * 
         * @param {*} label 
         * @param {*} level 
         * @param {*} msg 
         */
        _log(label, level, msg) {
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