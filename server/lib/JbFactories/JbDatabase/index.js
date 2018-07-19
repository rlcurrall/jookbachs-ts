/**
 * 
 * @param {*} deps 
 */
function dbFactory(deps) {

    // #region Dependency Setup
    // <editor-fold desc="Dependency Setup">
    if (!deps.MongoClient) {
        throw new Error(`Missing Dependency: Logger, MongoClient, and config are required!`);
    }

    const MongoClient = deps.MongoClient;
    const config = deps.config;

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

            MongoClient.connect(this.dbURL, function (err, db) {

                if (err) {
                    that.log('DbService', 'error', `Unable to connect to database - ${this.dbURL}\n${err}`);
                }

                that.log('DbService', 'info', 'Database connected/created!');

                that.db = db;
            });
        }

        /**
         * 
         */
        disconnect() {
            this.db.close();
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
        log (label, level, msg) {
            if (this.Logger) {
                this.Logger.log({label: label, level: level, message: msg});
            }
            else {
                console.log(msg);
            }
        }

        /**
         * 
         */
        getDB() {
            return this.db;
        }
    }

    return JbDatabase;
}

module.exports = dbFactory;