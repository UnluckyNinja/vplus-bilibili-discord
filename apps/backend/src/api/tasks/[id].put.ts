import { defineHandler, defineRouteMeta } from "nitro";
import { TaskZod, updateTask } from "../../composables/task.ts";
import { ZodError } from "zod";

defineRouteMeta({
  openAPI: {
    tags: ["task"],
    description: "Update task with specified id.",
  },
});

export default defineHandler(async (event) => {
  const { id } = event.context.params!;

  const json = await event.req.json();

  let task;
  try {
    task = TaskZod.parse(json);
  } catch (error) {
    event.res.status = 400;
    if (error instanceof ZodError) {
      return {
        error: error.issues,
      };
    }
    return {
      error: "Bad request data",
    };
  }

  await updateTask(id, task);

  event.res.status = 204;
  return;
});
