import { defineHandler } from "nitro";
import { useRuntimeConfig } from "nitro/runtime-config";

export default defineHandler((event) => {
  const { apiKey } = useRuntimeConfig();

  if (!apiKey) {
    event.res.status = 403;
    return `API access is disabled.`;
  }

  const token = event.url.searchParams.get("token");

  if (!token) {
    event.res.status = 401;
    return `Access denied.`;
  }

  let match = true;
  for (let i = 0; i < apiKey.length; ++i) {
    if (apiKey[i] !== token[i]) {
      match = false;
    }
  }
  if (!match) {
    event.res.status = 401;
    return `Access denied.`;
  }
  return;
});
