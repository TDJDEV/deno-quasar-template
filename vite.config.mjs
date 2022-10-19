import { defineConfig } from "npm:vite";
import vue from "npm:@vitejs/plugin-vue";
import { quasar, transformAssetUrls } from "npm:@quasar/vite-plugin";

import "npm:vue";
import "npm:quasar";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    quasar(),
  ],
});
