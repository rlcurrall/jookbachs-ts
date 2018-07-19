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
        constructor (config) {
            this.config = config;

            this.dbURL = "mongodb://" + config.db.host + ":" + config.db.port + "/" + config.db.name;            
        }

        connect() {
            let that = this;

            MongoClient.connect(this.dbURL, function (err, client) {
                if (err) {
                    that._log('DbService', 'error', `Unable to connect to database - ${that.dbURL}\n${err}`);
                }

                that._log('DbService', 'info', 'Database connected/created!');

                that.client = client;
                that.db = client.db(that.config.db.name);

                // // Trying to find a way to validate that the Tracks collection is in the DB
                // that.db.listCollections().toArray(function (err, res) {
                //     console.log(res)
                // })

                // // Testing out how to insert and query database
                // that.db.collection("Tracks").insertOne({
                //     name: 'test'
                // })
                // let val = that.db.collection("Tracks").find({
                //     name: 'test'
                // }).toArray(function(err, res) {
                //     if (err) throw err;
                //     console.log(res)
                // })
            });
        }

        insertTrack (track) {
            // have validation for schema
            this.db.collection('Tracks').insertOne(track, function (err, res) {
                if (err) return false
                else return true
            });
        }

        getTrack(query) {
            // have some kind of query validation
            return this.db.collection('Tracks').find(query)
        }

        getLibrary() {
            return this.db.collection('Tracks').find({})
        }

        /**
         * 
         */
        disconnect() {
            this.client.close();
        }

        /**
         * 
         * @param {*} logger 
         */
        setLogger(logger) {
            this.Logger = logger;
        }

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