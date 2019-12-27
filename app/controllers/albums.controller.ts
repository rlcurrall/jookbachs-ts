import { Response, Request, NextFunction } from "express";
import { Album } from "../entities/album.entity";

/**
 * Get all albums.
 *
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
async function getAllAlbums(req: Request, res: Response, next: NextFunction) {
  try {
    const albums = await Album.find();

    res.json(albums);
  } catch (e) {
    res.status(500);
    res.send(e);
  }
  next();
}

/**
 * Get an album by ID.
 *
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
async function getAlbumById(req: Request, res: Response, next: NextFunction) {
  try {
    const album = await Album.findOne(req.params.id);

    if (album) {
      res.json(album);
      next();
      return;
    }

    res.status(404);
    res.json({ message: "Album not found." });
  } catch (e) {
    res.status(500);
    res.send(e);
  }
  next();
}

/**
 * Get all tracks in a given album.
 *
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
async function getAlbumTracks(req: Request, res: Response, next: NextFunction) {
  try {
    const album = await Album.findOne(req.params.id);

    if (album) {
      const tracks = await album.tracks;

      res.json(tracks);
      next();
      return;
    }

    res.status(404);
    res.json({ message: "Album not found." });
  } catch (e) {
    res.status(500);
    res.send(e);
  }
  next();
}

export default {
  getAllAlbums,
  getAlbumById,
  getAlbumTracks,
};
