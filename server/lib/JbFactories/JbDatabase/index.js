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

    const MongoClient = deps.MongoDB.MongoClient;
    const Server = deps.MongoDB.Server;

    // </editor-fold>
    // #endregion

    class JbDatabase {

        /**
         * 
         * @param {*} config 
         */
        constructor (config, options) {
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

                that.db.listCollections().toArray(function (err, res) {
                    let hasTracks = false;
                    let hasPlaylists = false;

                    for ( let c in res) {
                        if (res[c].name == 'tracks')
                            hasTracks = true;
                        if (res[c].name == 'playlists')
                            hasPlaylists = true;
                    }

                    if (!hasTracks) {
                        that.db.createCollection('tracks', {
                            validator: {
                               $jsonSchema: {
                                  bsonType: "object",
                                  required: [ "title", "artist", "album", "track", "year", "path" ],
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
                    }
                    if (!hasPlaylists) {
                        that.db.createCollection('playlists');
                        that._log('DbService', 'info', 'Playlists collection created');
                    }

                    /* Uncomment to see how to retrieve data from db */
                    // setTimeout(() => { // delay incase collection not created
                    //     that.insertTrack({
                    //         title: "Fake Title",
                    //         artist: "Some guy",
                    //         album: "That One Album",
                    //         track: 10,
                    //         year: 12,
                    //         path: "path/to/song.mp3"
                    //     }).then(function (res) {
                    //         console.log(res.result)
                    //     }, function (err) {
                    //         console.log(err.message)
                    //     })
                    // }, 2000)


                    // that.getTrack({title: 'Fake Title'}).then(function(res) {
                    //     console.log(res)
                    // })

                    // that.getLibrary().then(function (res) {
                    //     console.log(res)
                    // })
                })
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
         * 
         * @param {*} track 
         */
        insertTrack (track) {
            // have validation for schema
            return new Promise( (resolve, reject) => {
                this.db.collection('tracks').insert(track, function (err, res) {
                    if (err) reject(err)
                    else resolve(res)
                })
            })
        }

        /**
         * 
         * @param {*} query 
         */
        getTrack(query) {
            return this.db.collection('tracks').findOne(query).then(function(res) {
                return res
            })
        }

        /**
         * 
         * @param {*} query 
         */
        getManyTracks(query) {
            return new Promise ((resolve, reject) => {
                this.db.collection('tracks').find(query).toArray(function (err, res) {
                    if (err) reject(err)
                    else resolve(res)
                })
            })
        }

        /**
         * 
         */
        getLibrary() {
            return new Promise ((resolve, reject) => {
                this.db.collection('tracks').find({}).toArray(function (err, res) {
                    if (err) reject(err)
                    else resolve(res)
                })
            })
        }

        // </editor-fold>
        // #endregion

        /**
         * 
         * @param {*} label 
         * @param {*} level 
         * @param {*} msg 
         */
        _log (label, level, msg) {
            if (this.Logger) {
                this.Logger.log({label: label, level: level, message: msg});
            }
            else {
                console.log(msg);
            }
        }
    }

    return JbDatabase;
}

module.exports = dbFactory;