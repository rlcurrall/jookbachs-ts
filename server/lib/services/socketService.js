/**
 * 
 * @param {*} deps 
 */
function socketService(deps) {
    let Logger = deps.Logger;
    let socketIO;

    if (!deps.socketIO) {
        throw new Error("[ SocketService ] Missing Dependency: socketIO is required")
    }

    socketIO = deps.socketIO;

    /**
     * 
     * @param {*} server 
     */
    function init(server) {

        var io = socketIO.listen(server);

        io.on('connect', function (socket) {

            Logger.log({label:'SocketService', level: 'socket', message: 'Connected'});

            socket.on('join', function (params, callback) {

                socket.join(params.playerName);

            });

            socket.on('message', function (msg) {
                Logger.log({label:'SocketService', level: 'socket', message: `${msg}`});
            });

            socket.on('disconnect', function () {
                Logger.log({label:'SocketService', level: 'socket', message: 'Disconnected'});
            });

        });
    }
    return {
        init: init
    }
}

module.exports = socketService;