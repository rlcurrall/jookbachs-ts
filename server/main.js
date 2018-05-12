var http = require('http');
var url = require('url');
var fs = require('fs');

// is server side if NW.js object isn't defined
var serverSide = typeof nw === "undefined";

// if run server-oriented
if (serverSide) {
	
	// create http server for api/streaming
	http.createServer(function (req, res) {
		
		//console.log(req);
		
		// get requested file name from url
		var q = url.parse(req.url, true);
		var filename = "." + q.pathname;
		
		if (filename == "./music") {
			
			filename = 'ui/music/Ramble On.flac';
			//filename = "ui/music/08 The Ocean.mp3";
			var stat = fs.statSync(filename);
			
			//console.log(stat);
			
			fs.readFile(filename, function (err, data) {

				// if error reading file, return 404
				if (err) {
					res.writeHead(404, {'Content-Type': 'text/html'});
					//console.log(err);
					return res.end("404 Not Found: " + filename);
				}  

				// write response content type
				res.writeHead(200, {
					'Content-Length': stat.size,
					'Transfer-Encoding': 'chunked'
				});

				// write response data
				//res.write(data);

				// end response
				//return res.end();
				
				fs.createReadStream(filename).pipe(res);

			});
			
		}
	
	// have http server listen on port 4200
	}).listen(4200);
	
	// create http server for webui
	http.createServer(function (req, res) {
		
		//console.log(req);
		
		// get requested file name from url
		var q = url.parse(req.url, true);
		var filename = "." + q.pathname;
		
		if (filename == './') {
			filename = 'ui/player.html';
		}

		var stat = fs.statSync(filename);
			
		console.log(stat);

		fs.readFile(filename, function (err, data) {

			// if error reading file, return 404
			if (err) {
				res.writeHead(404, {'Content-Type': 'text/html'});
				//console.log(err);
				return res.end("404 Not Found: " + filename);
			}  

			// write response content type
			res.writeHead(200, {  });

			// write response data
			res.write(data);

			// end response
			return res.end();
		});
	
	// have http server listen on port 80
	}).listen(8080);

// if run client-oriented with NW.js
} else {
	
	nw.Window.open('ui/player.html', {}, function(win) {});
	
}