/**
 * @module JbApp
 * @author Robb Currall
 */


// Array.prototype.diff = function (a) {
//     return this.filter(function (i) {
//         return a.indexOf(i) === -1;
//     });
// };

const JbServer = require('./JbServer');
const JbDatabase = require('./JbDatabase');
const JbRouter = require('./JbRouter');
const JbSocket = require('./JbSocket');
const JbAppManager = require('./JbAppManager');

module.exports = {
    JbServer,
    JbDatabase,
    JbRouter,
    JbSocket,
    JbAppManager
}