// import { fetch } from 'nitro'
import { hashQueries } from "utils/src/bilibili.js";
import type { DynamicInfo, DynamicInfoBase, FeedAPIResult } from "../types/bilibili";

// export type MessageInfo = MessageInfoBase & MessageInfoType

const MESSAGE_API = "https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space";

function signURL(url: URL, wbiImgKey: string, wbiSubKey: string) {
  const { w_rid, wts } = hashQueries(Object.fromEntries(url.searchParams), {
    wbiImgKey,
    wbiSubKey,
  })!;
  url.searchParams.set("w_rid", w_rid);
  url.searchParams.set("wts", wts);
  return url;
}

export interface BilibiliOptions {
  queries?: Record<string, string>;
  wbi?: {
    imgKey: string;
    subKey: string;
  };
  headers?: Record<string, string>;
}

let queueTimer = 0;

/**
 * 动态境外完全不可用，请使用视频
 * @deprecated
 */
export async function fetchBilibiliFeed(
  userID: string,
  options: BilibiliOptions = {},
): Promise<FeedAPIResult> {
  const target = new URL(MESSAGE_API);

  target.search = new URLSearchParams({
    offset: "",
    timezone_offset: "-480",
    platform: "web",
    web_location: "333.1387",
    features: "",
    dm_img_list: "[]",
    dm_img_str: "",
    dm_cover_img_str: "",
    dm_img_inter: "{}",
    "x-bili-device-req-json": '{"platform":"web","device":"pc","spmid":"333.1387"}',
    ...options.queries,
    host_mid: userID,
  }).toString();

  while (Date.now() < queueTimer) {
    await new Promise((r) => setTimeout(r, queueTimer - Date.now()));
  }
  queueTimer = Date.now() + 5000; // the first one in the queue get pass will reset timer

  signURL(
    target,
    options.wbi?.imgKey ? options.wbi.imgKey : "7cd084941338484aae1ad9425b84077c",
    options.wbi?.subKey ? options.wbi.subKey : "4932caff0ff746eab6f01bf08b70ac45",
  );

  const response = await fetch(target, {
    headers: {
      Host: "api.bilibili.com",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:150.0) Gecko/20100101 Firefox/150.0",
      Accept: "*/*",
      "Accept-Language": "zh-CN",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      Referer: `https://space.bilibili.com/${userID}/dynamic`,
      Origin: "https://space.bilibili.com",
      DNT: "1",
      "Sec-GPC": "1",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-site",
      Priority: "u=4",
      Cookie: "buvid3=ABAB1234-123B-234B-123A-114514AE86BF67168infoc",
      ...options.headers,
    },
    referrer: `https://space.bilibili.com/${userID}/dynamic`,
    method: "GET",
  });

  if (!response.ok) {
    // throw error
    console.error("Bilibili returned: " + response.status + ", " + response.statusText);
  }

  return response.json();
}

/**
 * 返回按时间降序排列
 */
export function transformFeed(json: FeedAPIResult) {
  const list = json.data.items;

  if (!list) {
    throw new Error("Bilibili server returned empty message list");
  }
  list.sort((a, b) => {
    // pub_ts 是unix时间戳，按降序排列，可以避免受置顶影响，单位为秒，在Date中使用须 *1000
    return b.modules.module_author.pub_ts - a.modules.module_author.pub_ts;
  });
  // 将json数据转换为简单的已定义数据
  const result = list
    .map<DynamicInfo | null>((item) => {
      const base: Omit<DynamicInfoBase, "url"> = {
        timestamp: item.modules.module_author.pub_ts,
        id_str: item.id_str,
        author: {
          name: item.modules.module_author.name,
          url: `https:${item.modules.module_author.jump_url}`,
          icon_url: item.modules.module_author.face,
        },
      };
      switch (item.type) {
        case "DYNAMIC_TYPE_AV":
          return {
            type: "DYNAMIC_TYPE_AV",
            title: item.modules.module_dynamic.major?.archive?.title ?? "",
            description: item.modules.module_dynamic.major?.archive?.desc ?? "",
            length: item.modules.module_dynamic.major?.archive?.duration_text ?? "",
            thumbnail: item.modules.module_dynamic.major?.archive?.cover ?? "",
            url: `https://www.bilibili.com/video/${item.modules.module_dynamic.major?.archive?.bvid}`,
            ...base,
          };
        case "DYNAMIC_TYPE_WORD":
          return {
            type: "DYNAMIC_TYPE_WORD",
            text: item.modules.module_dynamic.desc?.text ?? "",
            url: `https://t.bilibili.com/${item.id_str}`,
            ...base,
          };
        case "DYNAMIC_TYPE_DRAW":
          return {
            type: "DYNAMIC_TYPE_DRAW",
            text: item.modules.module_dynamic.desc?.text ?? "",
            images: item.modules.module_dynamic.major?.draw?.items?.map((it) => it.src) ?? [],
            url: `https://t.bilibili.com/${item.id_str}`,
            ...base,
          };
        case "DYNAMIC_TYPE_FORWARD":
          let originalName = item.orig?.modules.module_author.name ?? "";
          let originalText = "";
          if (item.orig?.type === "DYNAMIC_TYPE_AV") {
            originalText =
              item.orig.modules.module_dynamic.major.archive?.title +
              ` https://www.bilibili.com/video/${item.orig.modules.module_dynamic.major?.archive?.bvid}`;
          } else {
            originalText = item.orig?.modules.module_dynamic.desc?.text ?? "";
          }
          return {
            type: "DYNAMIC_TYPE_FORWARD",
            text: item.modules.module_dynamic.desc?.text ?? "",
            url: `https://t.bilibili.com/${item.id_str}`,
            originalName,
            originalText,
            ...base,
          };
      }
      return null; // 以防API修改出现了新的消息类型，忽略对应消息
    })
    .filter((it) => it) as DynamicInfo[];
  return result;
}

// MARK: Videos
const VIDEO_API = "https://api.bilibili.com/x/space/wbi/arc/search";

export async function fetchBilibiliVideo(
  userID: string,
  options: BilibiliOptions = {},
): Promise<any> {
  const target = new URL(VIDEO_API);

  target.search = new URLSearchParams({
    pn: "1",
    ps: "5",
    tid: "0",
    special_type: "",
    order: "pubdate",
    index: "0",
    keyword: "",
    order_avoided: "true",
    platform: "web",
    web_location: "333.1387",
    dm_img_list: "[]",
    dm_img_str: "V2ViR0wgMS",
    dm_cover_img_str:
      "QU5HTEUgKE5WSURJQSwgTlZJRElBIEdlRm9yY2UgR1RYIDk4MCBEaXJlY3QzRDExIHZzXzVfMCBwc181XzApLCBvciBzaW1pbGFyR29vZ2xlIEluYy4gKE5WSURJQS",
    dm_img_inter: '{"ds":[],"wh":[4904,4883,48],"of":[212,424,212]}',
    ...options.queries,
    mid: userID,
  }).toString();

  while (Date.now() < queueTimer) {
    await new Promise((r) => setTimeout(r, queueTimer - Date.now()));
  }
  queueTimer = Date.now() + 5000; // the first one in the queue get pass will reset timer

  signURL(
    target,
    options.wbi?.imgKey ? options.wbi.imgKey : "7cd084941338484aae1ad9425b84077c",
    options.wbi?.subKey ? options.wbi.subKey : "4932caff0ff746eab6f01bf08b70ac45",
  );

  const response = await fetch(target, {
    headers: {
      Host: "api.bilibili.com",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0",
      Accept: "*/*",
      "Accept-Language": "zh-CN",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      Referer: `https://space.bilibili.com/${userID}/upload/video`,
      Origin: "https://space.bilibili.com",
      DNT: "1",
      "Sec-GPC": "1",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-site",
      Priority: "u=4",
      Cookie: "buvid3=ABAB1234-123B-234B-123A-114514AE86BF67168infoc",
      ...options.headers,
    },
    referrer: `https://space.bilibili.com/${userID}/upload/video`,
    method: "GET",
  });

  if (!response.ok) {
    // throw error
    console.error("Bilibili returned: " + response.status + ", " + response.statusText);
  }

  return response.json();
}

export function transformVideo(json: any): DynamicInfo[] {
  const list = json.data?.list?.vlist as any[];
  if (!list) {
    throw new Error("Bilibili server returned empty message list");
  }

  const result = list.map<DynamicInfo>((item: any) => {
    return {
      type: "DYNAMIC_TYPE_AV",
      timestamp: item.created,
      id_str: "",
      author: {
        name: item.author,
        url: `https://space.bilibili.com/${item.mid}`,
      },
      title: item.title ?? "",
      description: item.description ?? "",
      length: item.length ?? "",
      thumbnail: item.pic ?? "",
      url: `https://www.bilibili.com/video/${item.bvid}`,
    };
  });
  return result;
}
