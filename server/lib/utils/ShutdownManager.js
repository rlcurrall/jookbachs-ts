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

    let Server;

    function ShutdownManager (server) {
        Server = server;
        
        readline.emitKeypressEvents(process.stdin);
        process.stdin.setRawMode(true);

        process.stdin.on('keypress', function (str, key) {
            if (key.ctrl && key.name === 'c'){
                Logger.log({label: 'Shutdown', level: 'info', message: 'Starting shutdown process'});
                Server.closeServer();
                Logger.log({label: 'Shutdown', level: 'info', message: 'Shutdown complete'});
                process.exit();
            }
        });
    }

    return {
        ShutdownManager: ShutdownManager
    }
}

module.exports = ShutdownManagerFactory;