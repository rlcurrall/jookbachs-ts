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
                        if (res[c].name == 'Tracks')
                            hasTracks = true;
                        if (res[c].name == 'Playlists')
                            hasPlaylists = true;
                    }

                    if (!hasTracks) {
                        that.db.createCollection('Tracks');
                        that._log('DbService', 'info', 'Tracks collection created');
                    }
                    if (!hasPlaylists) {
                        that.db.createCollection('Playlists');
                        that._log('DbService', 'info', 'Playlists collection created');
                    }

                    /* Uncomment to see how to retrieve data from db */
                    // that.insertTrack({name: 'test'})

                    // setTimeout(() => {
                    //     that.getTrack({name: 'test'}, console.log)
                    // }, 2000) // added timer to ensure record inserted

                    // that.getLibrary(console.log)
                })
            });
        }

        /**
         * Close connection to the database
         */
        disconnect() {
            this.client.close();
        }

        // #region DB Queries
        // <editor-fold desc="DB Queries">

        insertTrack (track) {
            // have validation for schema
            this.db.collection('Tracks').insertOne(track, function (err, res) {
                if (err) return false
                else return true
            });
        }

        getTrack(query, callback) {
            this.db.collection('Tracks').findOne(query).then(function(res) {
                callback(res)
            })
        }

        getManyTracks(query, callback) {
            this.db.collection('Tracks').find(query).toArray(function (err, res) {
                if (err) throw err

                callback(res)
            })
        }

        getLibrary(callback) {
            this.db.collection('Tracks').find({}).toArray(function (err, res) {
                if (err) throw err

                callback(res)
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