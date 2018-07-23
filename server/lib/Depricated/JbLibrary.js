/**
 * 
 * @param {*} deps 
 */
function libraryModel(deps) {

	// #region Dependency Setup
	// <editor-fold desc="Dependency Setup">


	if (!deps.path || !deps.walk || !deps.JbTrack) {
        throw new Error(`Missing Dependency: path, walk, and JbTrack are required!`);
        // Add error handling...
	}

	const path = deps.path;
	const walk = deps.walk;
	const JbTrack = deps.JbTrack;

	// </editor-fold>
	// #endregion

	/**
	 * 
	 */
	class JbLibrary {

		/**
		 * 
		 * @param {*} dirPath 
		 */
		constructor(dirPath) {
			let fileTypeInclusions = ['.flac', '.m4a', '.mp3'];

			this.path = path.normalize(dirPath);
			this.isLoaded = false;
			var tracksList = [];
			this.count = 0;

			let that = this;

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
					let newTrack = new JbTrack(that.count, root + path.sep + stat.name);
					newTrack.loadMetaData().then(
						(res) => {
							tracksList.push(newTrack);
							that.count++;
							next();
						},
						(err) => {
							console.log("error " + err)
						}
					)
				}
				else {
					next();
				}

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

	return JbLibrary;
}

module.exports = libraryModel;