
function dbManagerFactory (deps) {


    const walk = deps.walk;
    const path = deps.path;

    // Private functions
    const _log = Symbol('log');
    const _diff = Symbol('diff');
    
    // Private Objects
    const _db = Symbol('DB');
    const _model = Symbol('Model');
    const _logger = Symbol('Logger');

    class DbManager {

        constructor (db, options) {
            let that = this;
            this[_db] = db;

            if (options) {
                if (options.Logger)
                    this[_logger] = options.Logger;
                if (options.model)
                    this[_model] = options.model;
                if (options.config)
                    this.config = options.config;
                    
                // Warn for unsupported options
                let unSup = that[_diff](Object.getOwnPropertyNames(options), ['Logger', 'model', 'config']);
                unSup.forEach( (opt) => {
                    that[_log](`The [${opt}] option is not supported`, 'warn');
                });
            }

            this[_log]('Database manager created');
        }

        dropAndReloadDB () {
            let that = this;
            let DB = this[_db];

            DB.dropAllCollections().then(
                (res) => {
                    DB.createAllCollections().then(
                        (res) => {
                            that.loadAllLibraries();
                        },
                        (err) => {
                            that[_log](err, 'error');
                            throw err;
                        }
                    )
                },
                (err) => {
                    DB.createAllCollections().then(
                        (res) => {
                            that.loadAllLibraries();
                        },
                        (err) => {
                            that[_log](err, 'error');
                            throw err;
                        }
                    )
                }
            )
        }

        loadAllLibraries () {
            let JbModel = this[_model];
            let DB = this[_db];
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
                        let newTrack = new JbModel(count, root + path.sep + stat.name);
                        newTrack.loadMetaData().then(
                            (res) => {
                                DB.insertRecord("tracks", newTrack.toJson());
                                // DB.findOrCreate("tracks", newTrack.toJson());
                                count++;
                                next();
                            },
                            (err) => {
                                that[_log](err, 'error');
                            }
                        )
                    }
                    else {
                        next();
                    }

                });
            })
        }

        [_diff](a, b) {
            return a.filter(function (i) {
                return b.indexOf(i) === -1;
            });
        }

        [_log](message, level, label) {
            if (this[_logger]) {
                if (label === undefined)
                    label = 'DbManager';
                if (level === undefined)
                    level = 'info';
                this[_logger].log({label, level, message});
            } else {
                console.log(message);
            }
        }
    }

    return DbManager;
}

module.exports = dbManagerFactory;