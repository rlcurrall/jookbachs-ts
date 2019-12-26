import Vue from "vue";
import Vuex from "vuex";
import queue from "./queue";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    queue
  }
});
