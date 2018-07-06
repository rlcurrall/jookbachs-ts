// import modules
const path = require('path');
const jsmediatags = require("@mattbasta/jsmediatags");


class track {

	constructor(id, filepath, libraryId) {

		this.id = id;
		this.path = path.normalize(filepath);
		this.title = null;
		this.libraryId = libraryId;

		// read file metadata
		jsmediatags.read(this.path, {

			onSuccess: function(tag) {
				//console.log(tag.tags.title);
				// outputs to console, but returns null every time
				//return tag.tags.title;
				this.title = tag.tags.title;
			},

			onError: function(error) {
				//console.log(':(', error.type, error.info);
			}

		});

	}

	insertTrack(db, callback) {

		// Get the documents collection
		var collection = db.collection('tracks');

		// Insert some documents
		collection.insertOne({'path': this.path}, function(err, result) {

			if (err) throw err;

			callback(result);

		});

	}

	findAllTracks(db, callback) {

		var collection = db.collection('tracks');

		// Insert some documents
		collection.find({}).toArray(function(err, result) {

			if (err) throw err;

			callback(result);

		});

	}

}

module.exports = track;
