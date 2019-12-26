import { statSync, createReadStream } from "fs";
import { Response, Request, NextFunction } from "express";
import { Track } from "../entities/track.entity";

/**
 * Get a track by ID
 *
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
async function getTrackById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await Track.findOne(req.params.id);

    if (data) {
      res.json(data);
      next();
      return;
    }

    res.status(404);
    res.json({ message: "No track found." });
  } catch (e) {
    res.status(500);
    res.send(e);
  }
  next();
}

/**
 * Get all tracks
 *
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
async function getAllTracks(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await Track.find();

    if (data.length > 0) {
      res.json(data);
      next();
      return;
    }

    res.status(404);
    res.json({ message: "No tracks." });
  } catch (e) {
    res.status(500);
    res.json({ message: e });
  }
  next();
}

/**
 * Get tracks by a query string
 *
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
async function getTracksByQuery(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (Object.keys(req.query).length) {
    // do something with
  }

  next();
}

/**
 * Stream the audio file for a given track.
 *
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
async function streamTrack(req: Request, res: Response, next: NextFunction) {
  try {
    const track = await Track.findOne(req.params.id);

    if (track) {
      const stat = statSync(track.path);
      const stream = createReadStream(track.path);

      res.writeHead(200, {
        "Content-Type": "audio/mpeg", // TODO: This needs to be dynamically set
        "Content-Length": stat.size,
        "Accept-Ranges": "bytes",
      });

      stream.pipe(res);
      next();
      return;
    }

    res.status(404);
    res.json({ message: "No track found." });
  } catch (e) {
    res.status(500);
    res.send(e);
  }
  next();
}

export default {
  streamTrack,
  getTrackById,
  getAllTracks,
  getTracksByQuery,
};
