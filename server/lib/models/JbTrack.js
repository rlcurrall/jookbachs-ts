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

			let that = this;

			// NEW METHOD USING MUSIC-METADATA
			// This module seems to have the most active developer and far more popular than the other two by far
			tagReader.parseFile(filepath)
			.then(
				function (metadata) {
					let tags = metadata.common;
					that.id = id;
					that.path = path.normalize(filepath);
					that.title = (typeof tags === 'undefined' || typeof tags.title === 'undefined') ? 'Unknown' : tags.title;
					that.artist = (typeof tags === 'undefined' || typeof tags.artist === 'undefined') ? 'Unknown' : tags.artist;
					that.track = (typeof tags === 'undefined' || typeof tags.track === 'undefined') ? 'Unknown' : tags.track;
					that.album = (typeof tags === 'undefined' || typeof tags.album === 'undefined') ? 'Unknown' : tags.album;
					that.year = (typeof tags === 'undefined' || typeof tags.year === 'undefined') ? 'Unknown' : tags.year;
					that.image = (typeof tags === 'undefined' || typeof tags.picture === 'undefined') ? {data: 'none'} : tags.picture;
					that.libraryId = libraryId;
				}
			);

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

		/**
		 * Inserts the provided track into the database
		 * 
		 * @param {object} db 
		 * @param {function} callback 
		 */
		insertTrack(db, callback) {

			// Get the documents collection
			var collection = db.collection('tracks');

			// Insert some documents
			collection.insertOne({
				'path': this.path
			}, function (err, result) {

				if (err) throw err;

				callback(result);

			});

		}

		/**
		 * 
		 * @param {*} db 
		 * @param {*} callback 
		 */
		findAllTracks(db, callback) {

			var collection = db.collection('tracks');

			// Insert some documents
			collection.find({}).toArray(function (err, result) {

				if (err) throw err;

				callback(result);

			});

		}

	}

	return JbTrack;
}

module.exports = trackModel;