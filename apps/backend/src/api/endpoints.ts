import { defineHandler, defineRouteMeta } from "nitro";

defineRouteMeta({
  openAPI: {
    tags: ["meta"],
    description: "Get a list of available endpoints",
  },
});

export default defineHandler((event) => {
  return ["/tasks", "/tasks/:id"];
});
