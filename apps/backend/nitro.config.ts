import { defineConfig } from "nitro";

export default defineConfig({
  compatibilityDate: "2026-05-20",
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
  preset: "cloudflare-module",
  cloudflare: {
    deployConfig: true,
    wrangler: {
      kv_namespaces: [
        {
          binding: "STORAGE",
          id: "ad6536f98f31470788f90b68188db4d0",
        },
      ],
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
