import { defineHandler, defineRouteMeta } from "nitro";
import { createTask, TaskZod } from "../../composables/task.ts";
import { ZodError } from "zod";

defineRouteMeta({
  openAPI: {
    tags: ["task"],
    description: "Create new task.",
  },
});

export default defineHandler(async (event) => {
  const json = await event.req.json();

  let task;
  try {
    task = TaskZod.omit({ id: true }).partial().parse(json);
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

  const result = await createTask(task);

  event.res.status = 201;
  event.res.headers.set("Location", "/api/tasks/" + result.id);

  return {
    result,
  };
});
