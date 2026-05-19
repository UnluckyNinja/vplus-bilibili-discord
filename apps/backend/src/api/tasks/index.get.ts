import { defineHandler, defineRouteMeta } from "nitro";
import { listTasks } from "../../composables/task.ts";

defineRouteMeta({
  openAPI: {
    tags: ["task"],
    description: "Get a list of tasks.",
  },
});

export default defineHandler(async (event) => {
  const result = await listTasks();
  return {
    result,
  };
});
