import { Response, Request, NextFunction } from "express";
import { Artist } from "../entities/artist.entity";

/**
 * Get all artists.
 *
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
async function getAllArtists(req: Request, res: Response, next: NextFunction) {
  try {
    const artists = await Artist.find();

    res.json(artists);
  } catch (e) {
    res.status(500);
    res.send(e);
  }
  next();
}

/**
 * Get all tracks by a given artist.
 *
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
async function getArtistTracks(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const artist = await Artist.findOne(req.params.id);

    if (artist) {
      const tracks = await artist.tracks;

      res.json(tracks);
      next();
      return;
    }

    res.status(404);
    res.json({ message: "No artist found." });
  } catch (e) {
    res.status(500);
    res.send(e);
  }
  next();
}

/**
 * Get a track by ID.
 *
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
async function getArtistById(req: Request, res: Response, next: NextFunction) {
  try {
    const artist = await Artist.findOne(req.params.id);

    if (artist) {
      res.json(artist);
      next();
      return;
    }

    res.status(404);
    res.json({ message: "No artist found." });
  } catch (e) {
    res.status(500);
    res.send(e);
  }
  next();
}

export default {
  getAllArtists,
  getArtistById,
  getArtistTracks,
};
