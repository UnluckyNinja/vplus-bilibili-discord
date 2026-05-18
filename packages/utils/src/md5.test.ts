import { expect, test } from "vite-plus/test";
import { md5 } from "./md5.ts";

test(`MD5 result should match website's`, () => {
  const input = `mid=2&web_location=333.1387&wts=1779042822ea1db124af3c7062474693fa704f4ff8`;
  expect(md5(input)).toMatchInlineSnapshot(`"7237713faec955c7d9ec13c2f1e6ae2f"`);
});
