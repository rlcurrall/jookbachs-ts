import { readdirSync } from "fs";
import { getConnection } from "typeorm";
import { parseFile } from "music-metadata";
import { resolve, extname, basename } from "path";

import { Album } from "../entities/album.entity";
import { Track } from "../entities/track.entity";
import { Artist } from "../entities/artist.entity";

/**
 * A function to iterate over the libraries defined in the .env file and update
 * the data store to contain paths to all tracks.
 *
 * @todo: This needs to be improved. Currently it will not load files from
 *        folders nested in the specified paths.
 */
export async function refreshLibrary() {
  await getConnection();
  const libs = this.getLibraryPaths();

  for (let lib of libs) {
    try {
      const files = readdirSync(lib);

      for (let file of files) {
        if ([".mp3"].includes(extname(file))) {
          const path = resolve(process.env.HOME, "Music", file);
          const metadata = await parseFile(path);

          let artist: Artist;
          let album: Album;
          let track: Track;

          artist = await Artist.findOne({ name: metadata.common.artist });

          if (!artist) {
            artist = new Artist();
            artist.name = metadata.common.artist;
          }

          album = await Album.findOne({ name: metadata.common.album });

          if (!album) {
            album = new Album();
            album.name = metadata.common.album;
            album.year = metadata.common.year;
            album.picture = metadata.common.picture[0].data.toString("base64");
          }

          track = await Track.findOne({
            path,
          });

          if (!track) {
            track = new Track();
          }

          if (!track.updatedAt) {
            track.title = metadata.common.title || basename(file);
            track.year = metadata.common.year;
            track.number = metadata.common.track.no;
            track.artist = artist;
            track.album = album;
            track.path = path;
            track.duration = metadata.format.duration;
            track.format = metadata.format.dataformat;
            track.createdAt = new Date();
          }

          artist.save();
          album.save();
          track.save();
        }
      }
    } catch (e) {
      // Todo: properly handle error.
      console.log(e);
    }
  }
}

/**
 * A small helper function to get all the Library Paths from the .env file.
 */
export function getLibraryPaths() {
  let result: string[];

  if (process.env.LIBRARY_PATHS) {
    if (process.env.LIBRARY_PATHS.includes(",")) {
      let paths = process.env.LIBRARY_PATHS.split(",");

      result = paths.map((p: string) => {
        return resolve(p.trim().replace("~", process.env.HOME));
      });

      return result;
    }

    result = [
      resolve(process.env.LIBRARY_PATHS.trim().replace("~", process.env.HOME)),
    ];
    return result;
  }

  return [];
}

export default {
  refreshLibrary,
  getLibraryPaths,
};
