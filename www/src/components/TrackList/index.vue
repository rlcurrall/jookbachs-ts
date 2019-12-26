<template>
  <div>
    <p class="mt-4 text-xl font-extrabold">All Tracks:</p>
    <ul class="border rounded flex flex-col h-64 overflow-y-scroll w-full">
      <li
        class="hover:bg-gray-400 cursor-pointer p-2 flex items-center"
        v-for="track in tracks"
        :key="track.id"
        @click="addSong(track)"
      >
        <img
          class="w-16"
          :src="`data:image/jpeg;base64,${track.album.picture}`"
        />
        <div class="flex-grow">
          {{ track.title }}
        </div>
      </li>
    </ul>
  </div>
</template>
<script>
import { mapMutations } from "vuex";
export default {
  props: {
    tracks: {
      type: Array,
      default: () => []
    }
  },

  methods: {
    ...mapMutations({
      addSong: "queue/addSong"
    })
  }
};
</script>
