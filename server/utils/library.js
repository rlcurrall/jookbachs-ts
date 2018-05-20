// import npm modules
const walk = require('walk');

// import user defined modules
const track = require('./track');

class library {
	
	constructor(dirpath) {
		
		this.path = dirpath;
		var tracksList = [];

		// setup walker for music library directory
		var walker  = walk.walk(this.path, { followLinks: false });

		walker.on('file', function(root, stat, next) {
			
			// instantiate new track object
			let newTrack = new track(root + '/' + stat.name);
			
			// Add this file to the list of files
			tracksList.push(newTrack);
			
			next();
			
		});

		walker.on('end', function() {
			console.log(tracksList);
		});
		
		this.tracksList = tracksList;
		this.currentTrackIndex = 0;
		
	}
	
	getAllTracks() {
		return this.tracksList;
	}
	
}

module.exports = library;