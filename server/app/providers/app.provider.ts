/*
|--------------------------------------------------------------------------
| Define DI Providers
|--------------------------------------------------------------------------
|
| The dependency injection container we are using, Tsyringe, has the notion
| of 'providers'. Here you can specify the providers for specific modules
| for the application.
|
| NOTE: In this project this file is not properly utilized. Consider removing.
|
*/

import csurf from "csurf";
import { container } from "tsyringe";
import { Middleware } from "../typings";
import session from "../middleware/session";

/*
|--------------------------------------------------------------------------
| Register Middleware
|--------------------------------------------------------------------------
|
| Middleware are registered with the DI container so that they can be
| applied to controllers by using the string token identifiers.
|
*/

container
  .register<Middleware>("web:middleware", {
    useValue: [session, csurf({ cookie: true })],
  })
  .register<Middleware>("csurf:middleware", {
    useValue: csurf({ cookie: true }),
  })
  .register<Middleware>("session:middleware", { useValue: session });
