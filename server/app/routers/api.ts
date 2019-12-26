import { Router } from "express";
import TracksController from "../controllers/tracks.controller";
import ArtistsController from "../controllers/artists.controller";
import AlbumsController from "../controllers/albums.controller";

const router = Router();

// Tracks Routes
router.get(
  "/tracks",
  TracksController.getTracksByQuery,
  TracksController.getAllTracks,
);
router.get("/tracks/:id/stream", TracksController.streamTrack);
router.get("/tracks/:id", TracksController.getTrackById);

// Artists Routes
router.get("/artists", ArtistsController.getAllArtists);
router.get("/artists/:id/tracks", ArtistsController.getArtistTracks);
router.get("/artists/:id", ArtistsController.getArtistById);

// Album Routes
router.get("/albums", AlbumsController.getAllAlbums);
router.get("/albums/:id/tracks", AlbumsController.getAlbumTracks);
router.get("/albums/:id", AlbumsController.getAlbumById);

export default router;
