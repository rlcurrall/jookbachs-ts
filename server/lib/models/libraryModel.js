/**
 * 
 * @param {*} deps 
 */
function libraryModel(deps) {
	let Logger;
	let path;
	let walk;
	let track

	Logger = deps.logger;

	if (!deps.path || !deps.walk || !deps.track) {
        Logger.log({label:'DbService', level: 'error', message: `Missing Dependency: path, walk, and track are required!`});
        // Add error handling...
	}

	path = deps.path;
	walk = deps.walk;
	track = deps.track;

	/**
	 * 
	 */
	class Library {

		/**
		 * 
		 * @param {*} dirPath 
		 */
		constructor(dirPath) {
			let fileTypeInclusions = ['.flac', '.m4a', '.mp3'];

			this.path = path.normalize(dirPath);
			this.isLoaded = false;
			var tracksList = [];
			var count = 0;

			// setup walker for music library directory
			var walker = walk.walk(this.path, {
				followLinks: false
			});

			walker.on('file', function (root, stat, next) {

				let included = fileTypeInclusions.find(function (element) {
					return element === path.extname(stat.name);
				});
				let hidden = stat.name.substr(0, 1) === '.';

				if (included && !hidden) {
					let newTrack = new track(count, root + path.sep + stat.name);
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
		Library: Library
	}
}

module.exports = libraryModel;