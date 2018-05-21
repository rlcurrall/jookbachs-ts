// import npm modules
const jsmediatags = require("@mattbasta/jsmediatags");

class track {
	
	constructor(filepath) {
		
		this.path = filepath;
		//this.title = this.getTitle();
		
	}
	
	getTitle() {
		
		// read file metadata
		jsmediatags.read(this.path, {

			onSuccess: function(tag) {
				//console.log(tag.tags.title);
				// outputs to console, but returns null every time
				return tag.tags.title;
			},

			onError: function(error) {
				console.log(':(', error.type, error.info);
			}

		});
		
	}
	
}

module.exports = track;