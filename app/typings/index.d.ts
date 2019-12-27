import { RequestHandler } from "express";

export type Middleware = RequestHandler | RequestHandler[];
