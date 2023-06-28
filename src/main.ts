import { createApp } from "vue";
import { Quasar } from "quasar";
import router from "./router";
import "@quasar/extras/material-icons/material-icons.css";
import "quasar/dist/quasar.css";
import App from "./App.vue";

const myApp = createApp(App);

myApp.use(router);

myApp.use(Quasar, {
  plugins: {},
});

myApp.mount("#app");
