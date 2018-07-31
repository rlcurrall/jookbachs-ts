
function dbManagerFactory (deps) {


    const walk = deps.walk;
    const path = deps.path;

    // Private functions
    const log = Symbol('log');

    class DbManager {

        constructor (db, model, config, options) {
            this.DB = db;
            this.model = model;
            this.config = config;

            if (options) {
                if (options.Logger)
                    this.Logger = options.Logger;
                
            }
        }

        dropAndReloadDB () {
            let that = this;
            let DB = this.DB;

            DB.dropAllCollections().then(
                (res) => {
                    DB.createAllCollections().then(
                        (res) => {
                            that.loadAllLibraries();
                        },
                        (err) => {
                            that[log](err, 'error');
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
                            that[log](err, 'error');
                            throw err;
                        }
                    )
                }
            )
        }

        loadAllLibraries () {
            let JbModel = this.model;
            let DB = this.DB;
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
                                console.log("error " + err);
                            }
                        )
                    }
                    else {
                        next();
                    }

                });
            })
        }

        [log](message, level, label) {
            if (this.Logger) {
                if (label === undefined)
                    label = 'DbManager';
                if (level === undefined)
                    level = 'info';
                this.Logger.log({label, level, message});
            } else {
                console.log(message);
            }
        }
    }

    return DbManager;
}

module.exports = dbManagerFactory;