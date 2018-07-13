/**
 * 
 * @param {*} deps 
 */
function socketFactory(deps) {

    // #region Dependency setup

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
        constructor(server, logger) {

            this.Logger = logger;
            this.sockets = [];
            this.nextSocketId = 0;

            let that = this;

            let io = socketIO.listen(server);

            io.on('connect', function (socket) {
            
                let socketId = this.nextSocketId++;
                this.sockets[socketId] = socket;
    
                that.log('JbSocket', 'socket', 'Connected');
    
                socket.on('message', function (msg) {
                    that.log('JbSocket', 'socket', msg);
                });
    
                socket.on('disconnect', function () {
                    that.log('JbSocket', 'socket', 'Disconnected');
                });
    
            });
            
            that.log('JbSocket', 'info', 'Sockets Initialized');
        }

        /**
         * 
         */
        closeSockets () {
            for (var socketId in this.sockets) {
                sockets[socketId].destroy();
            }
        }

        /**
         * 
         * @param {*} logger 
         */
        setLogger (logger) {
            this.Logger = logger;
        }

        /**
         * 
         * @param {*} label 
         * @param {*} level 
         * @param {*} msg 
         */
        log (label, level, msg) {
            if (this.Logger) {
                this.Logger.log({label: label, level: level, message: msg});
            }
            else {
                console.log(msg);
            }
        }
    }

    return JbSocket;
}

module.exports = socketFactory;