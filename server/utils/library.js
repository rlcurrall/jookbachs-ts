// import modules
const path = require('path');
const walk = require('walk');
const track = require('./track');

var fileTypeExclusions = ['.jpg', '.png', '.bmp', '.db', '.log', '.ini', '.m3u', '.m3u8',
	'.DS_Store', '._.DS_Store', '.accurip', '.cue'];

class library {

	constructor(dirpath) {

		this.path = path.normalize(dirpath);
		var tracksList = [];

		// setup walker for music library directory
		var walker  = walk.walk(this.path, { followLinks: false });

		walker.on('file', function(root, stat, next) {

			// instantiate new track object
			let newTrack = new track(root + path.sep + stat.name);
			let excluded = fileTypeExclusions.find(function(element) {
				return element === path.extname(newTrack.path);
			});
			let hidden = path.basename(newTrack.path).substr(0, 1) === '.';

			if (!excluded && !hidden) {
				// Add this file to the list of files
				tracksList.push(newTrack);
			}

			next();

		});

		walker.on('end', function() {
			//console.log(tracksList);
			//tracksList.reverse();
		});

		this.tracksList = tracksList;
		this.currentTrackIndex = 0;

	}

	getAllTracks() {
		return this.tracksList;
	}

}

module.exports = library;
