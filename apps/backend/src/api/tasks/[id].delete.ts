import { defineHandler, defineRouteMeta } from "nitro";
import { hasTask, removeTask } from "../../composables/task.ts";

defineRouteMeta({
  openAPI: {
    tags: ["task"],
    description: "Delete task with specified id.",
  },
});

export default defineHandler(async (event) => {
  const { id } = event.context.params!;

  if (!hasTask(id)) {
    event.res.status = 404;
    return;
  }

  await removeTask(id);

  event.res.status = 204;
  return;
});
