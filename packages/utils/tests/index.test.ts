import { expect, test } from "vite-plus/test";
import { hashQueries } from "../src/bilibili.ts";

test("match wbi", () => {
  const query = `pn=1&ps=40&tid=0&special_type=&order=pubdate&mid=2&index=0&keyword=&order_avoided=true&platform=web&web_location=333.1387&dm_img_list=[]&dm_img_str=V2ViR0wgMS&dm_cover_img_str=QU5HTEUgKE5WSURJQSwgTlZJRElBIEdlRm9yY2UgR1RYIDk4MCBEaXJlY3QzRDExIHZzXzVfMCBwc181XzApLCBvciBzaW1pbGFyR29vZ2xlIEluYy4gKE5WSURJQS&dm_img_inter={"ds":[],"wh":[4808,5436,92],"of":[47,94,47]}`;

  const url = new URL("http://localhost/");
  url.search = query;
  const obj = Object.fromEntries(url.searchParams.entries());

  expect(
    hashQueries(
      obj,
      {
        wbiImgKey: "7cd084941338484aae1ad9425b84077c",
        wbiSubKey: "4932caff0ff746eab6f01bf08b70ac45",
      },
      1779297558,
    ),
  ).toMatchInlineSnapshot(`
    {
      "w_rid": "cff4486f0ddb3c22aaf5daf4e2ff0765",
      "wts": "1779297558",
    }
  `);
});
