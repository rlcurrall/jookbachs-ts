/**
 * Factory for the JbSocket class that injects all necessary dependencies.
 *
 * @param {object} deps
 * @returns
 */
function socketFactory(deps) {

    // #region Dependency setup

    let socketIO;

    if (!deps.socketIO) {
        throw new Error("[ SocketService ] Missing Dependency: socketIO is required")
    }
    socketIO = deps.socketIO;

    // #endregion

    /**
     * Interface to Socket.IO used by JbServer.
     *
     * @class JbSocket
     */
    class JbSocket {
        
        /**
         * Creates an instance of JbSocket.
         * @constructor
         * 
         * @param {object} server
         * @param {object} options
         * @memberof JbSocket
         */
        constructor(server, options) {
            this.server = server;
            this.sockets = [];
            this.nextSocketId = 0;

            if (options) {
                if (options.Logger)
                    this.Logger = options.Logger;
            }
        }

        /**
         * Create a socket listening on the server received by the constructor, and define
         * socket responses
         *
         * @memberof JbSocket
         */
        startListening() {
            let that = this;
            let io = socketIO.listen(this.server);

            io.on('connect', function (socket) {
            
                let socketId = that.nextSocketId++;
                that.sockets[socketId] = socket;
    
                that._log('JbSocket', 'socket', 'Connected');
    
                socket.on('message', function (msg) {
                    that._log('JbSocket', 'socket', msg);
                });
    
                socket.on('disconnect', function () {
                    that._log('JbSocket', 'socket', 'Disconnected');
                });
    
            });
            
            that._log('JbSocket', 'info', 'Sockets Initialized');
        }

        /**
         * Begin listening on the server provided by constructor
         */


        /**
         * Destroy all sockets and disconnect from all existing connections
         *
         * @memberof JbSocket
         */
        closeSockets () {
            let that = this;
            for (let socketId in that.sockets) {
                let socket = that.sockets[socketId];
                socket.disconnect(true);
            }
        }

        
        /**
         * Private Logger used by the JbSocket class.
         * @private
         *
         * @param {*} label
         * @param {*} level
         * @param {*} msg
         * @memberof JbSocket
         */
        _log (label, level, msg) {
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