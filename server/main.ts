/*
|--------------------------------------------------------------------------
| Bootstrap & Imports
|--------------------------------------------------------------------------
|
| Run bootstrap scripts and register global functions. This is done before
| any application logic to ensure that helper functions are available in
| all other files.
|
*/

import "./bootstrap";

/*
|--------------------------------------------------------------------------
| Application Imports
|--------------------------------------------------------------------------
|
| All imports specific to the application. This occurs after the bootstrap
| import to ensure there all helpers are available.
|
*/

import "./app/providers/app.provider";
import Server from "./app";

/*
|--------------------------------------------------------------------------
| Application Instance
|--------------------------------------------------------------------------
|
| Using the server class to create a new instance of the application. Once
| created, calling the boot method will start the server.
|
*/

const server = new Server();

server.boot().listen();
