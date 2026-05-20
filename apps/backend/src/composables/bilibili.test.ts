import { expect, test } from "vite-plus/test";
import { fetchBilibiliFeed, transformFeed } from "./bilibili";

test("Bilibili feed", async () => {
  const json = await fetchBilibiliFeed("2");

  console.info(json?.message);
  expect(json.code).toBe(0);
  const transformed = transformFeed(json);
  expect(transformed.length > 0);
  console.info(transformed.length);
  console.info(transformed[0]);
  return;
});
