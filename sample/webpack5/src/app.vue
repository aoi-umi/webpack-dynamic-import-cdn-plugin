<template>
  <div>
    <router-link v-for="ele in routerConfig" :key="ele.path" :to="ele.path">
      <button class="ivu-btn ivu-btn-primary">{{ele.text}}</button>
    </router-link>
    <router-view></router-view>
  </div>
</template>

<style>
button {
  margin: 5px;
}
</style>
<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import { routerConfig } from "./router";

@Component
export default class App extends Vue {
  routerConfig = routerConfig;
}
</script>

