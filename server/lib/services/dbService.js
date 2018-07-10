/**
 * 
 * @param {*} deps 
 */
function dbService(deps) {

    let MongoClient;
    let config;

    if (!deps.MongoClient || !deps.config) {
        throw new Error('[ DbService ] Missing Dependency: MongoClient and config are required');
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
                console.log('[ DbService ]\t\tError: unable to connect to database: ' + dbURL);
                console.log(err);
            }

            console.log("[ DbService ]\t\tDatabase connected/created!");

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