class JbRouter {

    constructor (config, DB, url) {

        if (this.constructor === JbRouter) {
            throw new TypeError('Abstract class "JbRouter" cannot be instantiated directly.');
        }

        if (this.assignRoute === undefined) {
            throw new TypeError('Classes extening JbRouter must implement the assignRoute method');
        }

        this.url = url;
        this.config = config;
        this.DB = DB;
    }

    getUrl () {
        return this.url;
    }

    setLogger (logger) {
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

    assignRoute () {
        throw new ReferenceError('The assignRoute function must be defined');
    }
}

module.exports = JbRouter;