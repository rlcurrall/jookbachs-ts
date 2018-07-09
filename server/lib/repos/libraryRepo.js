// ===========================
// IMPORT MODULES
// ===========================
const fs = require('fs');
const track = require('services/trackService');
const library = require('services/libraryService');

// read in config/server.json
const config = JSON.parse(fs.readFileSync('server/config/server.json', 'utf8'));

// create new library objects for all elements in config
var libraries = [];
config.libraryPaths.forEach(function(libraryPath) {
    libraries.push(new library(libraryPath));
});

module.exports = libraries;