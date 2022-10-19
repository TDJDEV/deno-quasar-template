import { createApp } from "vue";
import { Quasar } from "quasar";
import "./style.css";
import App from "./App.vue";

const myApp = createApp(App);

myApp.use(Quasar, {
  plugins: {},
});

myApp.mount("#app");
