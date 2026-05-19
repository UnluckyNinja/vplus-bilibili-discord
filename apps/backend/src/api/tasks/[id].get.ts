import { defineHandler, defineRouteMeta } from "nitro";
import { getTask } from "../../composables/task.ts";

defineRouteMeta({
  openAPI: {
    tags: ["task"],
    description: "Get task with specified id.",
  },
});

export default defineHandler(async (event) => {
  const { id } = event.context.params!;

  const result = await getTask(id);

  if (!result) {
    event.res.status = 404;
    return;
  }

  return {
    result,
  };
});
