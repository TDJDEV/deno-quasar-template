import { defineConfig } from "npm:vite";
import vue from "npm:@vitejs/plugin-vue";
import { quasar, transformAssetUrls } from "npm:@quasar/vite-plugin";

import "npm:vue";
import "npm:vue-router";
import "npm:quasar";
import "npm:@quasar/extras";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({template: { transformAssetUrls } }),
    quasar(),
  ],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } }
});
