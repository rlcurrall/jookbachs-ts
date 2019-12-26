export const getQueue = ({ songs }) => songs;
export const getCurrentSong = ({ songs, currentSongIndex }) =>
  songs[currentSongIndex];
