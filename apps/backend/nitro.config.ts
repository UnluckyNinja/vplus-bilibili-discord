import { defineConfig } from "nitro";

export default defineConfig({
  experimental: {
    tasks: true,
  },
  scheduledTasks: {
    "* * * * *": ["watcher"],
  },
  serverDir: "./src",
  runtimeConfig: {
    apiKey: "",
  },
  routeRules: {
    "/api/**": {
      cors: true,
    },
  },
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
