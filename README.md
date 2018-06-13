# README #

Personal music streaming / synchronization service

### Software Prerequisites ###
* Node.js 10.x and NPM 6.x (or build using included Dockerfile for Docker)
* MongoDB 2.x server

### Security ###
* You must provide your own .key/.crt/.pem files at this time.
* To disable SSL/TLS, edit the code.

### How to run ###
* Clone the repo.
* Under the **server/** directory, create a directory named **config**.
* Create and enter the following (with your info) into the file **server/config/server.json** (note that at currently the server will only read in the first entry in the list of libraryPaths):

    ```json
	{
		"serverName": "someNameHere",
		"httpsPort": 8443,
		"tlsOptions": {
			"crtPath": "path/to/certificateFile.crt",
			"keyPath": "path/to/keyFile.key"
		},
		"db": {
			"host": "localhost",
			"port": 27017,
			"name": "jsjookbachs"
		},
		"libraryPaths": [
			"/music"
		]
	}
    ```

* Either run the start script with 'npm start' ...
* Or build a Docker image using:
	```
	docker build -t "sweylo/jsjookbachs" <directory of cloned repo>
	```
and start a container with the image (if you keep the libraryPaths the same as above in the config example):
	```
	docker run --name=jsJookBachs -p 8443:8443 -v /host/path/to/music:/music sweylo/jsjookbachs
	```
and open up your music directory to the directory specified in the container. Don't use your whole library right now as the library class reads in the whole directory every time it starts.
