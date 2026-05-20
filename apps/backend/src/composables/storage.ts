import { useStorage as nitroStorage } from "nitro/storage";

let storage: ReturnType<typeof nitroStorage> | null = null;

const LATEST_FEED_TIME_PREFIX = `latest-feed-time:`;

export function useStorage() {
  if (storage) {
    return storage;
  }
  storage = nitroStorage("KV");
  return storage;
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
