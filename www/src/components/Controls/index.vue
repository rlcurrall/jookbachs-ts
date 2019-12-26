<template>
  <div class="flex flex-col">
    <audio
      controls
      autoplay
      crossorigin=""
      ref="audio"
      @ended="next"
      @durationchange="event => (duration = event.target.duration)"
      @timeupdate="
        event => (currentTime = Math.floor(event.target.currentTime))
      "
      :src="sourceUrl"
    ></audio>

    {{ Math.floor(currentTime / 60) }}:{{ currentTime % 60 }} / {{ duration }}

    <div>
      <button
        v-if="paused"
        class="border rounded bg-green-600 px-6 py-2"
        @click="
          $refs.audio.play();
          paused = false;
        "
      >
        Play
      </button>
      <button
        v-if="!paused"
        class="border rounded bg-green-600 px-6 py-2"
        @click="
          $refs.audio.pause();
          paused = true;
        "
      >
        Pause
      </button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
export default {
  computed: {
    ...mapGetters({
      queue: "queue/getQueue",
      current: "queue/getCurrentSong"
    }),

    sourceUrl() {
      return this.current
        ? `http://localhost:5000/api/tracks/${this.current.id}/stream`
        : null;
    }
  },

  data: () => ({
    paused: false,
    currentTime: 0,
    duration: 0
  }),

  methods: {
    ...mapMutations({
      next: "queue/nextSong",
      prev: "queue/previousSong"
    })
  }
};
</script>
