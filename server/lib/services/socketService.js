/**
 * 
 * @param {*} deps 
 */
function socketService(deps) {
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

            console.log('[ SocketService ]\tconnected');

            socket.on('join', function (params, callback) {

                socket.join(params.playerName);

            });

            socket.on('message', function (msg) {
                console.log('[ SocketService ]/tmessage: ' + msg);
            });

            socket.on('disconnect', function () {
                console.log('[ SocketService ]\tdisconnected');
            });

        });
    }
    return {
        init: init
    }
}

module.exports = socketService;