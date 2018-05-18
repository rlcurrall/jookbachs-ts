// import npm modules
const walk = require('walk');

// import user defined modules
const track = require('./track');

class library {
	
	constructor(dirpath) {
		
		this.path = dirpath;
		let tracksList = [];

		// setup walker for music library directory
		var walker  = walk.walk(this.path, { followLinks: false });

		walker.on('file', function(root, stat, next) {
			
			// Add this file to the list of files
			tracksList.push(new track(root + '/' + stat.name));
			
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
	
	getCurrentTrack() {
		
	}
	
}

module.exports = library;