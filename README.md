# README #

Personal music streaming / synchronization service

### Software Prerequisites ###
* Node.js 10.x and NPM 6.x (or build using included Dockerfile for Docker)
* MongoDB 2.x server

### Security ###
* You must provide your own .key/.crt/.pem files at this time.
* To disable SSL/TLS, edit the code.

### Logging ###
The server implements a logger that writes to three files:
* error.log
* sysInfo.log
* traffic.log

Each of these logs are stored in the */server/logs* folder which is not created by default. To start logging to these files simply create the *logs* folder, otherwise nothing will be logged.

### How to run ###
* Clone the repo.
* Under the **server/** directory, create a directory named **config**.
* Create and enter the following (with your info) into the file **server/config/server.json** (note that at currently the server will only read in the first entry in the list of libraryPaths):

    ```json
	{
		"serverName": "someNameHere",
		"appDir": "Populated by the app",
		"httpsPort": 8443,
		"httpPort": 8080,
		"tlsOptions": {
			"crtPath": "path/to/certificateFile.crt",
			"keyPath": "path/to/keyFile.key"
		},
		"libraryPaths": [
			"/music"
		],
		"db": {
			"host": "localhost",
			"port": 27017,
			"name": "jsjookbachs",
			"collections": [
				{
					"name": "nameOfCollection",
					"validator": {
						"bsonType": "usually set to 'object'",
						"required": [
							"array",
							"of required",
							"properties"
						],
						"properties": {
							"array": {
								"bsonType": "int/string/bool/etc",
								"description": "what is this property"
							}
						}
					}
				}
			]
		}
	}
    ```

* **Either:** run ```npm install``` then start script with ```npm start```
* **Or:** build a Docker image using:
	```
	docker build -t "sweylo/jsjookbachs" <directory of cloned repo>
	```
and start a container with the image (if you keep the libraryPaths the same as above in the config example):
	```
	docker run --name=jsJookBachs -p 8443:8443 -v /host/path/to/music:/music sweylo/jsjookbachs
	```
and open up your music directory to the directory specified in the container. Don't use your whole library right now as the library class reads in the whole directory every time it starts.
