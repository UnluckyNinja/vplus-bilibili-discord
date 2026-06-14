import { useStorage } from "./storage.ts";
import * as z from "zod";

export const TASK_PREFIX = "task:";
export const ALL_TASKS = "all-tasks";

export type Task = z.infer<typeof TaskZod>;

export const TaskZod = z.object({
  id: z.string(),
  name: z.string(),
  mid: z.string(), // bilibili user mid
  imgKey: z.string(), // wbi auth
  subKey: z.string(), // wbi auth
  queries: z.record(z.string(), z.string()), // additional query string, for simplicity using its form in URL
  headers: z.record(z.string(), z.string()), // additional header string, multiline `Key: Value`
  discordWebhook: z.array(z.string()),
  atRoles: z.array(z.string()),
});

export async function createTask(task: Partial<Omit<Task, "id">> = {}) {
  const storage = useStorage();
  let id = crypto.randomUUID();
  while (await storage.hasItem(TASK_PREFIX + id)) {
    id = crypto.randomUUID();
  }
  const result = {
    mid: "",
    name: "New Task",
    imgKey: "",
    subKey: "",
    queries: {},
    headers: {},
    discordWebhook: [],
    atRoles: [],
    ...task,
    id: id,
  };
  await addIDtoList(id);
  await storage.setItem<Task>(TASK_PREFIX + id, result);
  return result;
}

export function getTask(id: string) {
  const storage = useStorage();
  return storage.getItem<Task>(TASK_PREFIX + id);
}

export function hasTask(id: string) {
  const storage = useStorage();
  return storage.hasItem(TASK_PREFIX + id);
}

export async function updateTask(id: string, value: Task) {
  const storage = useStorage();
  if (!(await storage.hasItem(TASK_PREFIX + id))) {
    await addIDtoList(id);
  }
  value.id = id;
  return storage.setItem<Task>(TASK_PREFIX + id, value);
}

export async function removeTask(id: string) {
  const storage = useStorage();
  await storage.removeItem(TASK_PREFIX + id);
  await removeIDFromList(id);
}

/**
 * @returns A list of task IDs
 */
export async function listTasks() {
  const storage = useStorage();
  return (await storage.getItem<string[]>(ALL_TASKS)) ?? [];
}

async function addIDtoList(id: string | string[]) {
  const storage = useStorage();

  const tasks = await listTasks();
  if (Array.isArray(id)) {
    tasks.push(...id);
  } else {
    tasks.push(id);
  }
  await storage.setItem<string[]>(ALL_TASKS, tasks);
}

async function removeIDFromList(id: string | string[]) {
  const storage = useStorage();

  const tasks = await listTasks();
  if (Array.isArray(id)) {
    for (const it of id) {
      tasks.splice(tasks.indexOf(it), 1);
    }
  } else {
    tasks.splice(tasks.indexOf(id), 1);
  }
  return storage.setItem<string[]>(ALL_TASKS, tasks);
}
