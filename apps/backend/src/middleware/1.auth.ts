import { defineHandler } from "nitro";
import { useRuntimeConfig } from "nitro/runtime-config";

export default defineHandler((event) => {
  const { apikey } = useRuntimeConfig();

  if (!apikey) {
    event.res.status = 403;
    return `API access is disabled.`;
  }

  const token = event.url.searchParams.get("token");

  if (!token) {
    event.res.status = 401;
    return `Access denied.`;
  }

  let match = true;
  for (let i = 0; i < apikey.length; ++i) {
    if (apikey[i] !== token[i]) {
      match = false;
    }
  }
  if (!match) {
    event.res.status = 401;
    return `Access denied.`;
  }
  return;
});
