/**
 * 
 * @param {*} deps 
 */
function trackService (deps) {
	let path;
	let nodeID3;

	if (!deps.path || !deps.nodeID3) {
		throw new Error("[ TrackService ] Dependency Error: path and node-id3 are required")
	}

	path = deps.path;
	nodeID3 = deps.nodeID3;

	/**
	 * 
	 */
	class track {

		/**
		 * 
		 * @param {*} id 
		 * @param {*} filepath 
		 * @param {*} libraryId 
		 */
		constructor(id, filepath, libraryId) {
	
			// Read file ID3 tags
			let tags = nodeID3.read(filepath);
	
			this.id = id;
			this.path = path.normalize(filepath);
			this.title = tags.title;
			this.artist = tags.artist;
			this.album = tags.album;
			this.year = tags.year;
			this.image = tags.image;
			this.libraryId = libraryId;
		}
	
		/**
		 * 
		 * @param {*} db 
		 * @param {*} callback 
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
		track: track
	}
}

module.exports = trackService;