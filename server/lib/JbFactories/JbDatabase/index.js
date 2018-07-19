/**
 * 
 * @param {*} deps 
 */
function dbFactory(deps) {

    // #region Dependency Setup
    // <editor-fold desc="Dependency Setup">
    if (!deps.MongoClient || !deps.config) {
        throw new Error(`Missing Dependency: Logger, MongoClient, and config are required!`);
    }

    const MongoClient = deps.MongoClient;
    const config = deps.config;

    // </editor-fold>
    // #endregion
    
    class JbDatabase {

        /**
         * 
         */
        constructor () {
            this.dbURL = "mongodb://" + config.db.host + ":" + config.db.port + "/" + config.db.name;            
        }

        init() {
            let that = this;

            MongoClient.connect(this.dbURL, function (err, db) {

                if (err) {
                    that.log('DbService', 'error', `Unable to connect to database - ${this.dbURL}\n${err}`);
                }

                that.log('DbService', 'info', 'Database connected/created!');

                that.db = db;
            });
        }

        setLogger(logger) {
            this.Logger = logger;
        }

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

        /**
         * 
         */
        closeDbConnection() {
            this.db.close();
        }
    }

    return JbDatabase;
}

module.exports = dbFactory;