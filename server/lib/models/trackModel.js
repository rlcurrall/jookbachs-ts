/**
 * Factory to generate the track class, receives an object with 
 * all dependencies to generate the class.
 * 
 * @param {object} deps 
 */
function trackModel(deps) {
	let path;
	let nodeID3;

	if (!deps.path || !deps.nodeID3) {
		throw new Error("[ TrackService ] Missing Dependency: path and node-id3 are required")
	}

	path = deps.path;
	nodeID3 = deps.nodeID3;

	/**
	 * Represents a music track
	 */
	class Track {

		/**
		 * Constructor for a track object, populates the object properties by
		 * reading the ID3 tags of the file using node-id3.
		 * 
		 * @param {number} id 
		 * @param {string} filepath 
		 * @param {number} libraryId 
		 */
		constructor(id, filepath, libraryId) {

			let tags = nodeID3.read(filepath);

			this.id = id;
			this.path = path.normalize(filepath);
			this.title = tags.raw.TIT2;
			this.artist = tags.raw.TPE1;
			this.track = tags.raw.TRCK;
			this.album = tags.raw.TALB;
			this.year = tags.raw.TYER;
			this.image = tags.raw.APIC;
			this.libraryId = libraryId;

			console.log('\n\n');
			console.log(tags);
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

	return {
		Track: Track
	}
}

module.exports = trackModel;