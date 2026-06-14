import { defineHandler, defineRouteMeta } from "nitro";
import { fetchBilibiliVideo, type BilibiliOptions } from "../../composables/bilibili.ts";

defineRouteMeta({
  openAPI: {
    tags: ["test"],
    description: "Test bilibili api function.",
  },
});

export default defineHandler(async (event) => {
  const mid = event.url.searchParams.get("mid") ?? "2";
  let options: BilibiliOptions = {};
  if (event.req.method === "POST") {
    try {
      options = await event.req.json();
    } catch {
      event.res.status = 400;
      return {
        error: "Invalid JSON payload.",
      };
    }
  }
  let video;
  try {
    video = await fetchBilibiliVideo(mid, options);
  } catch (error) {
    console.error(error);
    event.res.status = 500;
    if (error instanceof Error) {
      return {
        error: {
          name: error.name,
          message: error.message,
        },
      };
    }
    return {
      error: "Error occurred, check dashboard.",
    };
  }
  return {
    result: video,
  };
});
