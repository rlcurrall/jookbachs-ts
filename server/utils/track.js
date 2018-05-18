// import npm modules
const jsmediatags = require("@mattbasta/jsmediatags");

class track {
	
	constructor(filepath) {
		
		this.path = filepath;
		
		new jsmediatags.Reader(this.path)
			.setTagsToRead(["title", "artist"])
			.read({

				onSuccess: function(tag) {
					//console.log(tag);
					this.tag = tag;
				},

				onError: function(error) {
					console.log(':(', error.type, error.info);
				}

			});
		
	}
	
}

module.exports = track;