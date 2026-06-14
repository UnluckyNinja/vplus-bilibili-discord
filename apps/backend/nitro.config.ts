import { defineConfig } from "nitro";
import { provider } from "std-env";

export default defineConfig({
  compatibilityDate: "2026-05-20",
  experimental: {
    tasks: true,
  },
  scheduledTasks: {
    "*/5 * * * *": ["watcher"],
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
      name: "worker-bilibili-discord",
      kv_namespaces: [
        {
          binding: "STORAGE",
          id: "ad6536f98f31470788f90b68188db4d0",
        },
      ],
    },
  },
  storage: {
    ...determineStorage(),
  },
  typescript: {
    generateTsConfig: true,
  },
});

function determineStorage() {
  if (provider === "cloudflare_workers") {
    return {
      KV: {
        driver: "cloudflare-kv-binding", // https://unstorage.unjs.io/drivers/cloudflare
        binding: "STORAGE", // or from env
      },
    };
  } else if (provider === "netlify") {
    return {
      KV: {
        driver: "netlify-blobs",
        deployScoped: true,
      },
    };
  }
  return undefined;
}
