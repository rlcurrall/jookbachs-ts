// import           modules
const path = require('path');
const jsmediatags = require("@mattbasta/jsmediatags");

class track {

	constructor(filepath) {

		this.path = path.normalize(filepath);
		this.title = null;

		// read file metadata
		jsmediatags.read(this.path, {

			onSuccess: function(tag) {
				//console.log(tag.tags.title);
				// outputs to console, but returns null every time
				//return tag.tags.title;
				this.title = tag.tags.title;
			},

			onError: function(error) {
				console.log(':(', error.type, error.info);
			}

		});

	}

}

module.exports = track;
