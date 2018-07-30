
function dbManagerFactory (deps) {


    const walk = deps.walk;
    const path = deps.path;

    class DbManager {

        constructor (db, model, options) {
            this.DB = db;
            this.model = model;

            if (options) {
                if (options.Logger)
                    this.Logger = options.Logger;
                
            }
        }
    }
}