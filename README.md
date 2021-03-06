# README #

Personal music streaming / synchronization service

### Software Prerequisites ###
* Node.js 10.x and NPM 6.x (or build using included Dockerfile for Docker)
* Sqlite3

### How to run ###
* Clone the repo.

* **Either:** run ```npm install``` then start script with ```npm start```
* **Or:** build a Docker image using:
	```
	docker build -t "rlcurrall/jookbachs-ts" <directory of cloned repo>
	```
and start a container with the image (if you keep the libraryPaths the same as above in the config example):
	```
	docker run --name=JookBachs -p 8000:8000 -v /host/path/to/music:/music rlcurrall/jookbachs-ts
	```
and open up your music directory to the directory specified in the container. Don't use your whole library right now as the library class reads in the whole directory every time it starts.
