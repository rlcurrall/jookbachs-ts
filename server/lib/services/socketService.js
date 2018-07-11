/**
 * 
 * @param {*} deps 
 */
function socketService(deps) {

    // #region Dependency setup

    let Logger = deps.Logger;
    let socketIO;

    if (!deps.socketIO) {
        throw new Error("[ SocketService ] Missing Dependency: socketIO is required")
    }
    socketIO = deps.socketIO;

    // #endregion

    class Socket {
        constructor(server) {

            this.sockets = [];
            this.nextSocketId = 0;

            let io = socketIO.listen(server);

            io.on('connect', function (socket) {
            
                let socketId = this.nextSocketId++;
                this.sockets[socketId] = socket;
    
                Logger.log({label:'SocketService', level: 'socket', message: 'Connected'});
    
                socket.on('message', function (msg) {
                    Logger.log({label:'SocketService', level: 'socket', message: `${msg}`});
                });
    
                socket.on('disconnect', function () {
                    Logger.log({label:'SocketService', level: 'socket', message: 'Disconnected'});
                });
    
            });
        }

        closeSockets () {
            for (var socketId in this.sockets) {
                sockets[socketId].destroy();
            }
        }
    }

    return {
        Socket: Socket
    }
}

module.exports = socketService;