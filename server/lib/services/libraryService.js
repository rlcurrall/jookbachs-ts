// function libraryService (deps) {
// 	let path;
// 	let walk;
// 	let nodeID3;
// 	let track
	
// 	let fileTypeInclusions = ['.flac', '.m4a', '.mp3'];	

// 	if (!deps.path) {
// 		// NOTE: 	cannot use error at moment, on start server will return '/Music' for deps then return actual deps
// 		// 			need to resolve this issue before adding in error handling
// 		//throw new Error("[ LibraryService ] Dependency Error: path, walk, node-id3, and models/track are required")
// 	}

// 	path = deps.path;
// 	walk = deps.walk;
// 	nodeID3 = deps.nodeID3;
// 	track = deps.track;

// 	return {
		
// 	}
// }

const path = require('path');
const walk = require('walk');
const nodeID3 = require('node-id3');
const track = require('services/trackService');

let fileTypeInclusions = ['.flac', '.m4a', '.mp3'];	

class library {

	constructor(dirPath) {
		
		this.path = path.normalize(dirPath);
		this.isLoaded = false;
		var tracksList = [];
		var count = 0;

		// setup walker for music library directory
		var walker  = walk.walk(this.path, { followLinks: false });

		walker.on('file', function(root, stat, next) {

			// instantiate new track object
			let newTrack = new track(count, root + path.sep + stat.name);
			let included = fileTypeInclusions.find(function(element) {
				return element === path.extname(newTrack.path);
			});
			let hidden = path.basename(newTrack.path).substr(0, 1) === '.';

			if (included && !hidden) {
				// Add this file to the list of files
				tracksList.push(newTrack);
				count++;
			}

			next();

		});

		walker.on('end', function() {
			//console.log(tracksList);
			//tracksList.reverse();
			this.isLoaded = true;
		});

		this.tracksList = tracksList;
		this.currentTrackIndex = 0;
	}

	getAllTracks() {
		return this.tracksList;
	}

}

module.exports = library;
