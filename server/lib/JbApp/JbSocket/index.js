/**
 * @module JbSocket
 * @author Robb Currall {rlcurrall}
 */

/**
 * Abstract class used to interface to Socket.IO used by JbServer.
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

        if (server === undefined)
            throw new SyntaxError('JbSocket must recieve an instance of an http/https server.');

        if (this.constructor === JbSocket)
            throw new TypeError('Abstract class "JbSocket" cannot be instantiated directly.');

        this.server = server.getServerInstance();
        this.JbServer = server;
        this.sockets = [];
        this.nextSocketId = 0;

        if (options) {
            if (options.Logger)
                this.Logger = options.Logger;
            if (options.config)
                this.config = options.config;
        }
    }

    /**
     * Create a socket listening on the server received by the constructor, and define
     * socket responses
     *
     * @memberof JbSocket
     */
    startListening() {
        throw new ReferenceError('Classes extending JbSocket must implement the startListening method');
    }

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
     * Logger used by the JbSocket class.
     *
     * @param {string} message
     * @param {string} [level]
     * @param {string} [label]
     * @memberof JbSocket
     */
    log (message, level, label) {
        if (this.Logger) {
            if (label === undefined)
                label = 'JbSocket';
            if (level === undefined)
                level = 'socket';
            this.Logger.log({label, level, message});
        }
        else {
            console.log(message);
        }
    }
}

module.exports = JbSocket;