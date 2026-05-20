import { defineTask } from "nitro/task";
import { getTask, listTasks } from "../composables/task";
import { fetchBilibiliVideo, transformVideo } from "../composables/bilibili";
import { getLatestFeedTime, setLatestFeedTime } from "../composables/storage";
import { pushMessagesToDiscord } from "../composables/discord";

async function validateTask(taskID: string) {
  const task = await getTask(taskID);
  if (!task) {
    console.warn(`[validateTask] ${taskID.slice(0, 8)}... doesn't exist.`);
    return null;
  }
  if (!task.mid || task.discordWebhook.length === 0) {
    console.warn(`[validateTask] ${task.name}(${taskID.slice(0, 8)}) is missing key options.`);
    return null;
  }
  return task;
}

async function processTask(taskID: string) {
  const task = await validateTask(taskID);
  if (!task) {
    return;
  }
  console.info(`Processing "${task.name}"(${task.id.slice(0, 8)}...)`);

  const { headers, queries } = task;

  // let headers: Record<string, string> = {}
  // for (const h of task.headers.split('\n')) {
  //   const colon = h.indexOf(':')
  //   if (colon < 0) continue
  //   const key = h.slice(0, colon).trim()
  //   const value = h.slice(colon + 1, h.length).trim()
  //   if (key.length < 1 || value.length < 1) continue
  //   headers[key] = value
  // }

  let video: Awaited<ReturnType<typeof fetchBilibiliVideo>> | null = null;
  let retry = 3;
  while (retry-- && !video) {
    try {
      video = await fetchBilibiliVideo(task.mid, {
        headers,
        queries,
        wbi: { imgKey: task.imgKey, subKey: task.subKey },
      });
    } catch (e) {
      console.error(e);
    }
  }
  if (!video || !video.data.items?.length || video.data.items.length === 0) {
    console.error(`Fetching video from bilibili failed. Task ${task.name} aborted.`);
    return;
  }

  const messages = transformVideo(video);

  const lastTimestamp = await getLatestFeedTime(task.mid); // from Storage by mid
  const newMesssages = messages.filter((it) => it.timestamp > (lastTimestamp ?? 0));

  if (newMesssages.length < 1) {
    return;
  }
  // push to discord only when not first run
  if (lastTimestamp !== null) {
    try {
      await pushMessagesToDiscord(newMesssages, task.discordWebhook, task.atRoles);
      console.info(`Sent ${newMesssages.length} new messages of ${task.mid}.`);
    } catch (error) {
      console.error(error);
    }
  }

  await setLatestFeedTime(task.mid, newMesssages[0].timestamp);
}

export default defineTask({
  meta: {
    name: "watcher",
    description: "Scheduled crawler, watching for bilibili user posts, and push to discord",
  },
  async run({ payload, context }) {
    console.info("Watcher started...");

    /*
      1. read all tasks from kv
      2. Run each task one by one
      In each task
      3. fetch latest feed
      4. filter out new feed from list
      4.1 if run for the first time, just store timestamp and return
      5. push new feed to webhooks
      6. store timestamp for next run
    */
    const tasks = await listTasks();
    for (const task of tasks) {
      await processTask(task);
    }

    return { result: "Success" };
  },
});
