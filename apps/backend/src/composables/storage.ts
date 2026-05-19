import { useStorage as nitroStorage } from "nitro/storage";

let storage: ReturnType<typeof nitroStorage> | null = null;

const LATEST_FEED_TIME_PREFIX = `latest-feed-time:`;

export function useStorage() {
  if (storage) {
    return storage;
  }
  if (import.meta.env.HOSTING_PROVIDER === "cloudflare") {
    storage = nitroStorage("cloudflare");
    return storage;
  }
  throw new Error("Not run in supported environment. Consider adding your own storage");
}

export async function getLatestFeedTime(mid: string) {
  const storage = useStorage();
  return await storage.getItem<number>(LATEST_FEED_TIME_PREFIX + mid);
}

export function setLatestFeedTime(mid: string, time: number | null) {
  const storage = useStorage();
  if (time === null) {
    return storage.removeItem(LATEST_FEED_TIME_PREFIX + mid);
  }
  return storage.setItem(LATEST_FEED_TIME_PREFIX + mid, time);
}
