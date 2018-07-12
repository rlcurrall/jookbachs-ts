/**
 * 
 * @param {*} deps 
 */
function socketFactory(deps) {

    // #region Dependency setup

    let Logger = deps.Logger;
    let socketIO;

    if (!deps.socketIO) {
        throw new Error("[ SocketService ] Missing Dependency: socketIO is required")
    }
    socketIO = deps.socketIO;

    // #endregion

    class JbSocket {
        /**
         * 
         * @param {*} server 
         */
        constructor(server) {

            this.sockets = [];
            this.nextSocketId = 0;

            let io = socketIO.listen(server);

            io.on('connect', function (socket) {
            
                let socketId = this.nextSocketId++;
                this.sockets[socketId] = socket;
    
                Logger.log({label:'JbSocket', level: 'socket', message: 'Connected'});
    
                socket.on('message', function (msg) {
                    Logger.log({label:'JbSocket', level: 'socket', message: `${msg}`});
                });
    
                socket.on('disconnect', function () {
                    Logger.log({label:'JbSocket', level: 'socket', message: 'Disconnected'});
                });
    
            });
            
            Logger.log({label: 'JbSocket', level: 'info', message: 'Sockets Initialized'});
        }

        /**
         * 
         */
        closeSockets () {
            for (var socketId in this.sockets) {
                sockets[socketId].destroy();
            }
        }
    }

    return {
        JbSocket: JbSocket
    }
}

module.exports = socketFactory;