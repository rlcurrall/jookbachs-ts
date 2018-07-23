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

    // </editor-fold>
    // #endregion

    class JbDatabase {

        /**
         * 
         * @param {*} config 
         */
        constructor(config, options) {
            this.config = config;

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

                that._dropTracksCollection().then(
                    function (res) {
                        that._createAllCollections().then(
                            (res) => {
                                console.log(res)
                                // that._populateDB();
                            },
                            (err) => {
                                console.log(err);
                            }
                        );
                    },
                    function (err) {
                        console.log('Collection already deleted')
                        that._createAllCollections();
                    }
                );

                /* Uncomment to see how to retrieve data from db */
                // setTimeout(() => { // delay incase collection not created
                //     that.insertTrack({
                //         title: "Fake Title",
                //         artist: "Some guy",
                //         album: "That One Album",
                //         track: 10,
                //         year: 12,
                //         path: "path/to/song.mp3",
                //         id: 1
                //     }).then(function (res) {
                //         console.log(res.result)
                //     }, function (err) {
                //         console.log(err.message)
                //     })
                // }, 2000)


                // that.getTrack({'title': 'Fake Title'}).then(function(res) {
                //     console.log(res)
                // })

                // that.getLibrary().then(function (res) {
                //     console.log(res)
                // })
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
        // <editor-fold desc="DB Queries">

        /**
         * Returns a promise to insert a track and on a success will return an object
         * containing the result and number of records inserted, and on a failure will
         * return the error object
         * @param {*} track 
         */
        insertTrack(track) {
            return new Promise((resolve, reject) => {
                this.db.collection('tracks').insert(track, function (err, res) {
                    if (err) reject(err)
                    else resolve(res)
                })
            })
        }

        /**
         * Returns a promise that on a success will return a track object that matches
         * the query, and on a failure will return the error object
         * @param {*} query 
         */
        getTrack(query) {
            if (query._id) {
                query._id = ObjectId(query._id)
            }
            return this.db.collection('tracks').findOne(query).then(function (res) {
                return res
            }, function (err) {
                return err
            })
        }


        getTrackById(id) {
            let query = {}
            query._id = ObjectId(id)
            return this.db.collection('tracks').findOne(query).then(function (res) {
                return res
            }, function (err) {
                return err
            })
        }

        /**
         * Returns a promise that on a success will return an array of tracks that match
         * the query, and on a failure will return the error object
         * @param {*} query 
         */
        getTracksByQuery(query) {
            if (query.year) {
                query.year = parseInt(query.year)
            }
            return new Promise((resolve, reject) => {
                this.db.collection('tracks').find(query).toArray(function (err, res) {
                    if (err) reject(err)
                    else resolve(res)
                })
            })
        }

        /**
         * Returns a promise that on a success will return an array of all tracks in
         * the database, and on a failure will return the error object
         */
        getAllTracks() {
            return new Promise((resolve, reject) => {
                this.db.collection('tracks').find({}).toArray(function (err, res) {
                    if (err) reject(err)
                    else resolve(res)
                })
            })
        }

        // </editor-fold>
        // #endregion

        _dropTracksCollection() {
            let that = this

            return new Promise((resolve, reject) => {
                that.db.collection('tracks').drop(function (err, res) {
                    if (err) reject(err)
                    else resolve(res)
                })
            })
        }

        _createAllCollections() {
            let that = this

            return new Promise((resolve, reject) => {
                that.db.createCollection('tracks', {
                    validator: {
                        $jsonSchema: {
                            bsonType: "object",
                            required: ["title", "artist", "album", "track", "year", "path"],
                            properties: {
                                title: {
                                    bsonType: "string",
                                    description: "must be a string and is required"
                                },
                                artist: {
                                    bsonType: "string",
                                    description: "must be a string and is required"
                                },
                                album: {
                                    bsonType: "string",
                                    description: "must be a string and is required"
                                },
                                track: {
                                    bsonType: "int",
                                    minimum: 0,
                                    maximum: 3000,
                                    description: "must be an integer in [0, 3000] and is required"
                                },
                                year: {
                                    bsonType: "int",
                                    minimum: 0,
                                    maximum: 3000,
                                    description: "must be an integer in [0, 3000] and is required"
                                },
                                path: {
                                    bsonType: "string",
                                    description: "must be a string and is required"
                                }
                            }
                        }
                    }
                });
                that._log('DbService', 'info', 'Tracks collection created');

                that.db.createCollection('playlists');
                that._log('DbService', 'info', 'Playlists collection created');

                resolve();
            })
        }

        // _populateDB() {
        //     let that = this

        //     let dirPath = this.config.libraryPaths[0];
        // 	let fileTypeInclusions = ['.flac', '.m4a', '.mp3'];

        // 	// this.path = path.normalize(dirPath);
        // 	var tracksList = [];

        //     var walker = walk.walk(dirPath, {
        // 		followLinks: false
        //     });

        //     walker.on('file', function (root, stat, next) {

        // 		let included = fileTypeInclusions.find(function (element) {
        // 			return element === path.extname(stat.name);
        // 		});
        // 		let hidden = stat.name.substr(0, 1) === '.';

        // 		if (included && !hidden) {
        //             let newTrack = new JbTrack(root + path.sep + stat.name);
        //             newTrack.loadMetaData().then(
        //                 (res) => {
        //                     console.log("succ")
        //                 },
        //                 (err) => {
        //                     console.log("err")
        //                 }
        //             )
        // 			that.insertTrack(newTrack.toJson()).then(
        //                 (res) => {
        //                     console.log("res")
        //                 },
        //                 (err) => {
        //                     console.log("err")
        //                 }
        //             );
        // 		}

        // 		next();

        // 	});
        // }

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
    }

    return JbDatabase;
}

module.exports = dbFactory;