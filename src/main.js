import { createApp } from "vue";
import { Quasar } from "quasar";
import { createRouter, createWebHashHistory } from "vue-router";
import routes from "./router/routes.ts";
import "./style.css";
import "@quasar/extras/material-icons/material-icons.css";
import "quasar/dist/quasar.css";
import App from "./App.vue";

const myApp = createApp(App);

myApp.use(createRouter({
  history: createWebHashHistory(),
  routes,
}));

myApp.use(Quasar, {
  plugins: {},
});

myApp.mount("#app");
