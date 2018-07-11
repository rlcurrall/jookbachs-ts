/**
 * 
 * @param {*} deps 
 */
function ShutdownManagerFactory(deps) {

    let Logger = deps.Logger;
    let readline;

    if (!deps.readline) {
        Logger.log({label:'Shutdown', level: 'error', message: `Missing Dependency: readline is required!`});
        // Add error handling...
    }

    readline = deps.readline;

    function ShutdownManager () {
        
        readline.emitKeypressEvents(process.stdin);
        process.stdin.setRawMode(true);

        process.stdin.on('keypress', function (str, key) {
            if (key.ctrl && key.name === 'c'){
                closeDBConn();
                killServer();
                logShutdown();
                process.exit();
            }
        });
    }

    function logShutdown() {
        Logger.log({label: 'Shutdown', level: 'info', message: 'Shutting Down'});
    }

    function closeDBConn() {
        Logger.log({label: 'Shutdown', level: 'info', message: 'Closing DB connection'});
    }

    function killServer() {
        Logger.log({label: 'Shutdown', level: 'info', message: 'Shutting down server'});
    }

    return {
        ShutdownManager: ShutdownManager
    }
}

module.exports = ShutdownManagerFactory;