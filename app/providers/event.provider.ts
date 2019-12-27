import { Express } from "express";

/**
 * @class EventProvider
 *
 * @description Define events on the express apps internal event emitter. This
 * is a simple emitter for performing synchronous actions, but is not a proper
 * queue, so should not be utilized for resource intensive tasks such as video
 * processing.
 */
export default class EventProvider {
  /**
   * Register events for the application.
   *
   * @param app Express
   */
  public static register(app: Express): Express {
    // Register the `say-hello` event
    app.on("say-hello", () => {
      console.log("Hello World!");
    });

    // Register your events here.

    return app;
  }
}
