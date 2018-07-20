/**
 * A Factory used to generate the JbSocket class
 * @param {*} deps - an object containing all dependencies to be injected.
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
     * Class to create a socket that will listen on the given https server
     */
    class JbSocket {
        /**
         * Creates the socket
         * @param {HTTPS server} server 
         * @param {object} options - An object used to pass the different options for the socket
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
         * Have socket begin listening on the server and define socket responses
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
        closeSockets () {
            let that = this;
            for (let socketId in that.sockets) {
                let socket = that.sockets[socketId];
                socket.disconnect(true);
            }
        }

        /**
         * Log data to the console
         * 
         * @param {string} label 
         * @param {string} level 
         * @param {string/error object} msg 
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