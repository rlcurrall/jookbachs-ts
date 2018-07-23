/**
 * Factory to generate the track class, receives an object with 
 * all dependencies to generate the class.
 * 
 * @param {object} deps 
 */
function trackModel(deps) {

	// #region Dependency Setup
	// <editor-fold desc="Dependency Setup">

	if (!deps.path || !deps.tagReader) {
		throw new Error("Missing Dependency: path and node-id3 are required")
	}

	const path = deps.path;
	const tagReader = deps.tagReader;

	// </editor-fold>
	// #endregion

	/**
	 * Represents a music track
	 */
	class JbTrack {

		/**
		 * Constructor for a track object, populates the object properties by
		 * reading the ID3 tags of the file using node-id3.
		 * 
		 * @param {number} id 
		 * @param {string} filepath 
		 * @param {number} libraryId 
		 */
		constructor(id, filepath, libraryId) {
			this.filepath = filepath;
			this.id = id;
			this.libraryId = libraryId
			let that = this;

			// NEW METHOD USING MUSIC-METADATA
			// This module seems to have the most active developer and far more popular than the other two by far
			// tagReader.parseFile(filepath)
			// .then(
			// 	function (metadata) {
			// 		let tags = metadata.common;
			// 		that.id = id;
			// 		that.path = path.normalize(filepath);
			// 		that.title = (typeof tags === 'undefined' || typeof tags.title === 'undefined') ? 'Unknown' : tags.title;
			// 		that.artist = (typeof tags === 'undefined' || typeof tags.artist === 'undefined') ? 'Unknown' : tags.artist;
			// 		that.track = (typeof tags === 'undefined' || typeof tags.track === 'undefined') ? 'Unknown' : tags.track;
			// 		that.album = (typeof tags === 'undefined' || typeof tags.album === 'undefined') ? 'Unknown' : tags.album;
			// 		that.year = (typeof tags === 'undefined' || typeof tags.year === 'undefined') ? 'Unknown' : tags.year;
			// 		that.image = (typeof tags === 'undefined' || typeof tags.picture === 'undefined') ? {data: 'none'} : tags.picture;
			// 		that.libraryId = libraryId;
			// 	}
			// );

			// METHOD USING JSMEDIATAGS
			// tagReader.read(filepath, {
			// 	onSuccess: function  (res) {
			// 		let tags = res.tags
			// 		that.id = id;
			// 		that.path = path.normalize(filepath);
			// 		that.title = (typeof tags === 'undefined' || typeof tags.title === 'undefined') ? 'Unknown' : tags.title;
			// 		that.artist = (typeof tags === 'undefined' || typeof tags.artist === 'undefined') ? 'Unknown' : tags.artist;
			// 		that.track = (typeof tags === 'undefined' || typeof tags.track === 'undefined') ? 'Unknown' : tags.track;
			// 		that.album = (typeof tags === 'undefined' || typeof tags.album === 'undefined') ? 'Unknown' : tags.album;
			// 		that.year = (typeof tags === 'undefined' || typeof tags.year === 'undefined') ? 'Unknown' : tags.year;
			// 		that.image = (typeof tags === 'undefined' || typeof tags.picture === 'undefined') ? {data: 'none'} : tags.picture;
			// 		that.libraryId = libraryId;
			// 	},
			// 	onError: function (error) {
			// 		console.log(error)
			// 	}
			// })

			// OLD METHOD USING NODE-ID3
			// let tags = tagReader.read(filepath);
			// this.id = id;
			// this.path = path.normalize(filepath);
			// this.title = (typeof tags === 'undefined' || typeof tags.title === 'undefined') ? 'Unknown' : tags.title;
			// this.artist = (typeof tags === 'undefined' || typeof tags.artist === 'undefined') ? 'Unknown' : tags.artist;
			// this.track = (typeof tags === 'undefined' || typeof tags.trackNumber === 'undefined') ? 'Unknown' : tags.trackNumber;
			// this.album = (typeof tags === 'undefined' || typeof tags.album === 'undefined') ? 'Unknown' : tags.album;
			// this.year = (typeof tags === 'undefined' || typeof tags.year === 'undefined') ? 'Unknown' : tags.year;
			// this.image = (typeof tags === 'undefined' || typeof tags.image === 'undefined') ? {imageBuffer: {data: 'none'}} : tags.image;
			// this.libraryId = libraryId;
		}

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
				image: {},
				libraryId: this.libraryId
			}
			return res;
		}
	}

	return JbTrack;
}

module.exports = trackModel;