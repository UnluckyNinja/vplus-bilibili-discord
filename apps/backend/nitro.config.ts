import { defineConfig } from "nitro";

export default defineConfig({
  serverDir: "./src",
  storage: {
    cloudflare: {
      driver: "cloudflare-kv-binding", // https://unstorage.unjs.io/drivers/cloudflare
      binding: "STORAGE", // or from env
    },
  },
  typescript: {
    generateTsConfig: true,
  },
});
