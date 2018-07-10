/**
 * 
 * @param {*} deps 
 */
function dbService(deps) {

    let Logger;
    let MongoClient;
    let config;

    Logger = deps.Logger;

    if (!deps.Logger || !deps.MongoClient || !deps.config) {
        Logger.log({label:'DbService', level: 'error', message: `Missing Dependency: Logger, MongoClient, and config are required!`});
        // Add error handling...
    }

    MongoClient = deps.MongoClient;
    config = deps.config;

    let _db;

    /**
     * 
     */
    function initDB() {

        let dbURL = "mongodb://" + config.db.host + ":" + config.db.port + "/" + config.db.name;

        MongoClient.connect(dbURL, function (err, db) {

            if (err) {
                Logger.log({label:'DbService', level: 'error', message: `Unable to connect to database - ${dbURL}\n${err}`});
            }

            Logger.log({label:'DbService', level:'info', message: 'Database connected/created!'});

            _db = db;

        });
    }

    /**
     * 
     */
    function getDB() {
        return _db;
    }

    /**
     * 
     */
    function closeDbConnection() {
        _db.close();
    }

    return {
        initDB: initDB,
        getDB: getDB,
        closeDbConnection: closeDbConnection
    }
}

module.exports = dbService;