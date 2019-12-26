<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view />
    <controls />
  </div>
</template>

<script>
import Controls from "./components/Controls";
export default {
  components: {
    Controls
  }
};
</script>

<style src="./assets/css/tailwind.css"></style>
