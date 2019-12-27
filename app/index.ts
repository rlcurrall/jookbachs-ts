import cors from "cors";
import helmet from "helmet";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import express, { Express } from "express";
import RouteProvider from "./providers/route.provider";
import EventProvider from "./providers/event.provider";

/**
 * @class Server
 */
export default class Server {
  /**
   * @var app Express
   */
  public app: Express;

  /**
   * Construct the the Server Instance.
   *
   * @constructor
   */
  public constructor() {
    // Create Express Instance
    this.app = express();

    // Set Body Parser for App
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());
  }

  /**
   * Boot the Server by registering all routes.
   */
  public boot(): this {
    // Register Middleware
    this.app.use(cookieParser());
    this.app.use(helmet());

    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : [];

    const host = process.env.WWW_HOST ? process.env.WWW_HOST : "localhost";
    const protocol = process.env.APP_HTTPS === "true" ? "https://" : "http://";
    const port = process.env.WWW_PORT ? `:${process.env.WWW_PORT}` : "";
    const serverOrigin = `${protocol}${host}${port}`;
    allowedOrigins.push(serverOrigin);

    this.app.use(
      cors({
        origin: (origin, callback) => {
          if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
          } else {
            callback(new Error("Origin not allowed by CORS"));
          }
        },
      }),
    );

    //Register all routes and events
    this.app = RouteProvider.register(this.app);
    this.app = EventProvider.register(this.app);

    return this;
  }

  /**
   * Have the server start to listen for incoming requests.
   *
   * @param callback Function
   */
  public listen(callback?: Function): this {
    this.app.listen(process.env.SERVER_PORT, () => {
      if (callback) {
        callback();
      }
    });

    return this;
  }
}
