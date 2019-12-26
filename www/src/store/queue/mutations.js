/**
 * Remove a song from the queue at the given index.
 *
 * @param {array} songs Queue of songs
 * @param {number} index Index of song to remove
 */
export function removeSong({ songs, currentSongIndex }, index) {
  songs.splice(index, 1);

  if (currentSongIndex > songs.length - 1) {
    currentSongIndex--;
  }
}

/**
 * Add a song to the queue.
 *
 * @param {array} param0 Queue of songs
 * @param {object} song Song to add to queue
 */
export function addSong({ songs }, song) {
  songs.push(song);
}

/**
 * Clear the queue.
 *
 * @param {object} state Vuex store object
 */
export function clearQueue(state) {
  state.songs = [];
}

/**
 * Set the index of the current song.
 *
 * @param {object} state Vuex state
 * @param {number} index Index of the song
 */
export function setCurrentSong(state, index) {
  state.currentSongIndex = index;
}

/**
 * Move to the next song or return to the beginning of the queue.
 *
 * @param {array} songs Song queue
 * @param {number} currentSongIndex Index of current song
 */
export function nextSong(state) {
  console.log(state.currentSongIndex);
  if (state.currentSongIndex === state.songs.length - 1) {
    state.currentSongIndex = 0;
    return;
  }
  state.currentSongIndex++;
  console.log(state.currentSongIndex);
}

/**
 * Move to the previous song or return to the end of the queue.
 *
 * @param {array} songs Song queue
 * @param {number} currentSongIndex Index of current song
 */
export function previousSong(state) {
  if (state.currentSongIndex === 0) {
    state.currentSongIndex = state.songs.length - 1;
    return;
  }
  state.currentSongIndex--;
}
