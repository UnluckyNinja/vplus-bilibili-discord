import { defineHandler, defineRouteMeta } from "nitro";
import { fetchBilibiliFeed, transformFeed } from "../../composables/bilibili.ts";
import { pushMessagesToDiscord } from "../../composables/discord.ts";

defineRouteMeta({
  openAPI: {
    tags: ["test"],
    description: "Test bilibili api function.",
  },
});

export default defineHandler(async (event) => {
  const mid = event.url.searchParams.get("mid") ?? "2";
  const webhook = decodeURIComponent(event.url.searchParams.get("webhook") ?? "");
  const atRole = event.url.searchParams.get("atRole");
  if (!webhook) {
    return {
      error: "You need to provide a webhook to test discord related logic.",
    };
  }
  try {
    const feed = await fetchBilibiliFeed(mid);
    const messages = transformFeed(feed);
    await pushMessagesToDiscord(messages.slice(0, 1), [webhook], atRole ? [atRole] : undefined);
  } catch (error) {
    return { error };
  }
  return {
    result: "Success",
  };
});
