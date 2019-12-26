# JookBachs

Personal music streaming / synchronization service

## Software Prerequisites
* Node.js 10.x and NPM 6.x (or build using included Dockerfile for Docker)
* Sqlite3

## Installation

* Download/Clone the repository
* Install the dependencies:
    - `npm install`
    - `npm run bootstrap`
* Build the application:
    - `npm run build`
* Create a **`.env`** file by copying the **`.env.example`** file.
    - Update the **SERVER_PORT** to the appropriate port number.
    - Update the **LIBRARY_PATHS** to include all paths to your music.

## Launch

To start the application, from the root directory of the project run:
```bash
npm run start
```
Once the application has been started it will populate a SQLite database with metadata for all your music. You can then access the application in your browser by going to `http://localhost:8080`.