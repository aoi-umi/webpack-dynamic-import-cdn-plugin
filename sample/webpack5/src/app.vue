<template>
  <div>
    <router-link v-for="ele in routerConfig" :key="ele.path" :to="ele.path">
      <button>{{ele.text}}</button>
    </router-link>
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import { routerConfig } from "./router";

@Component
export default class App extends Vue {
  routerConfig = routerConfig;
}
</script>

