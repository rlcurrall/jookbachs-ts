/**
 * @module JbTrack
 * @author Robb Currall {rlcurrall}
 */

/**
 * Factory for the model, JbTrack, class that injects all necessary dependencies.
 *
 * @param {object} deps
 * @returns
 */
function trackModel(deps) {

	// #region Dependency Setup

	if (!deps.path || !deps.tagReader) {
		throw new Error("Missing Dependency: path and node-id3 are required")
	}

	const path = deps.path;
	const tagReader = deps.tagReader;

	// #endregion


	/**
	 * Used to load metadata for files using the media-metadata module.
	 *
	 * @class JbTrack
	 */
	class JbTrack {


		/**
		 * Creates an instance of JbTrack.
		 * @param {int} id
		 * @param {string} filepath
		 * @memberof JbTrack
		 */
		constructor(id, filepath) {
			this.filepath = filepath;
			this.id = id;
		}


		/**
		 * Uses the tag reader provided to extract the metadata for the given file.
		 *
		 * @returns
		 * @memberof JbTrack
		 */
		loadMetaData() {
			let that = this;

			return new Promise((resolve, reject) => {
				tagReader.parseFile(this.filepath)
				.then(
					function (metadata) {
						let tags = metadata.common;
						that.path = path.normalize(that.filepath);
						that.title = (typeof tags === 'undefined' || typeof tags.title === 'undefined') ? 'Unknown' : tags.title;
						that.artist = (typeof tags === 'undefined' || typeof tags.artist === 'undefined') ? 'Unknown' : tags.artist;
						that.track = (typeof tags === 'undefined' || typeof tags.track === 'undefined') ? 'Unknown' : tags.track;
						that.album = (typeof tags === 'undefined' || typeof tags.album === 'undefined') ? 'Unknown' : tags.album;
						that.year = (typeof tags === 'undefined' || typeof tags.year === 'undefined') ? 'Unknown' : tags.year;
						that.image = (typeof tags === 'undefined' || typeof tags.picture === 'undefined') ? {data: 'none'} : tags.picture;

						resolve(that);
					},
					function (err) {
						reject(err);
					}
				);
			});
		}


		/**
		 * Retrieves all metadata for the given file and returns it as a JSON object.
		 *
		 * @returns
		 * @memberof JbTrack
		 */
		toJson() {
			let res = {
				id: this.id,
				path: this.path,
				title: this.title,
				artist: this.artist,
				album: this.album,
				track: this.track.no,
				year: this.year,
				// image: this.image, // image too large, causes slow download of data, may need to store in file system rather than db
				image: {}
			}
			return res;
		}
	}

	return JbTrack;
}

module.exports = trackModel;
