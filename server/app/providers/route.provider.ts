import { Express, static as staticFiles } from "express";
import { container } from "tsyringe";
import ApiRouter from "../routers/api";
import WebRouter from "../routers/web";

export default class RouteProvider {
  /**
   * Register all routers to the application instance.
   *
   * @param app Express
   */
  public static register(app: Express): Express {
    // Register Web Routes
    app.use("/", container.resolve("web:middleware"), WebRouter);

    // Register API Routes
    app.use("/api", ApiRouter);

    // Register Static Files
    app.use(staticFiles("public"));

    return app;
  }
}
