import { defineHandler, defineRouteMeta } from "nitro";
import { fetchBilibiliFeed } from "../../composables/bilibili.ts";

defineRouteMeta({
  openAPI: {
    tags: ["test"],
    description: "Test bilibili api function.",
  },
});

export default defineHandler(async (event) => {
  const mid = event.url.searchParams.get("mid") ?? "2";
  let feed;
  try {
    feed = await fetchBilibiliFeed(mid);
  } catch (error) {
    return { error };
  }
  return {
    result: feed,
  };
});
