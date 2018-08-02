/**
 * Factory for the JbSocket class that injects all necessary dependencies.
 *
 * @param {Object} deps
 * @returns
 */
function socketFactory(deps) {

    // #region Dependency setup

    if (!deps.socketIO) {
        throw new Error("[ SocketService ] Missing Dependency: socketIO is required")
    }
    const socketIO = deps.socketIO;
    const JbSocket = deps.JbSocket;

    // #endregion

    /**
     * Interface to Socket.IO used by JbServer.
     *
     * @class Socket
     * @extends {JbSocket}
     */
    class Socket extends JbSocket {
        
        /**
         * Creates an instance of JbSocket.
         * @constructor
         * 
         * @param {Object} server
         * @param {Object} options
         * @memberof JbSocket
         */
        constructor(server, options) {
            super(server, options);

            if (options) {
                // load in options
            }

            this.startListening();
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
                that.sockets[socketId] = socket; // should we store these in the database for any reason?
    
                that.log(`Connected - ID: ${socket.id}`);
    
                socket.on('message', function (msg) {
                    that.log(`${msg} - ID: ${socket.id}`);
                });
    
                socket.on('disconnect', function () {
                    that.log(`Disconnected - ID: ${socket.id}`);
                });
    
            });
            
            that.log( 'Sockets Initialized', 'info' );
        }
    }

    return Socket;
}

module.exports = socketFactory;