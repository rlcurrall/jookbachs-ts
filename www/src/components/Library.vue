<template>
  <div>
    <div class="flex w-full">
      <track-list :tracks="tracks" class="w-1/2" />
      <div class="w-1/2">
        <p class="mt-4 text-xl font-extrabold">Queue:</p>
        <ul class="border rounded flex flex-col h-64 overflow-y-scroll w-full">
          <li
            class="hover:bg-gray-400 cursor-pointer p-2"
            v-for="(song, index) in queue"
            :key="`${song.id}-${index}`"
            @click="setCurrentSong(index)"
          >
            {{ song.title }}
          </li>
        </ul>
      </div>
    </div>
    <div class="mt-4 w-full flex justify-around">
      <button
        @click="prev"
        class="border rounded text-white bg-blue-600 py-2 px-4"
      >
        Prev
      </button>
      <button
        @click="next"
        class="border rounded text-white bg-blue-600 py-2 px-4"
      >
        Next
      </button>
    </div>
    <div class="mt-8 mx-12 p-2 border rounded">
      <p class="text-xl font-extrabold">Current Song:</p>
      <div class="mt-4 flex flex-col items-center" v-if="current">
        <p>
          {{ current.title }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import Axios from "axios";
import { mapGetters, mapMutations } from "vuex";
import TrackList from "./TrackList";
export default {
  components: {
    TrackList
  },

  data: () => ({
    tracks: []
  }),

  computed: {
    ...mapGetters({
      queue: "queue/getQueue",
      current: "queue/getCurrentSong"
    })
  },

  methods: {
    ...mapMutations({
      next: "queue/nextSong",
      prev: "queue/previousSong",
      setCurrentSong: "queue/setCurrentSong"
    }),
    getImage(buffer) {
      return btoa(String.fromCharCode.apply(null, buffer));
    }
  },

  async mounted() {
    try {
      const { data } = await Axios.get("http://localhost:5000/api/tracks");
      console.log(data);

      this.tracks = data;
    } catch (e) {
      // TODO: Handle error properly.
    }
  }
};
</script>
