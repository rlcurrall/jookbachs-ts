/**
 * 
 * @param {*} deps 
 */
function libraryService(deps) {
	let path;
	let walk;
	let track

	let fileTypeInclusions = ['.flac', '.m4a', '.mp3'];

	if (!deps.path || !deps.walk || !deps.track) {
		throw new Error("[ LibraryService ] Missing Dependency: path, walk, node-id3, and models/track are required")
	}

	path = deps.path;
	walk = deps.walk;
	track = deps.track;

	/**
	 * 
	 */
	class library {

		/**
		 * 
		 * @param {*} dirPath 
		 */
		constructor(dirPath) {

			this.path = path.normalize(dirPath);
			this.isLoaded = false;
			var tracksList = [];
			var count = 0;

			// setup walker for music library directory
			var walker = walk.walk(this.path, {
				followLinks: false
			});

			walker.on('file', function (root, stat, next) {

				// instantiate new track object
				let newTrack = new track(count, root + path.sep + stat.name);
				let included = fileTypeInclusions.find(function (element) {
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

			walker.on('end', function () {
				//console.log(tracksList);
				//tracksList.reverse();
				this.isLoaded = true;
			});

			this.tracksList = tracksList;
			this.currentTrackIndex = 0;
		}

		/**
		 * 
		 */
		getAllTracks() {
			return this.tracksList;
		}

	}

	return {
		library: library
	}
}

module.exports = libraryService;