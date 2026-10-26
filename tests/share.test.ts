import { describe, expect, it } from "vitest";
import {
  baselineFor,
  buildShareUrl,
  decodeShareState,
  encodeShareState,
  fromBase64Url,
  readShareToken,
  stripShareParam,
  toBase64Url,
} from "../lib/share";
import { getCountry } from "../lib/countries";
import type { CountryCode, PlatformId } from "../lib/types";

// ============================================================================
// 分享链接编解码 —— 守住三件事：
//   1. 往返不失真（对方点开看到的数字和我这边一模一样）
//   2. 默认值不进 URL（链接要短到能贴进微信）
//   3. 坏链接不能把页面搞崩（返回 null，按没有参数处理）
// ============================================================================

const tokenFor = (country: CountryCode, platform: PlatformId, diff: Record<string, unknown>) =>
  toBase64Url(JSON.stringify({ v: 1, c: country, p: platform, d: diff }));

describe("分享链接", () => {
  it("默认值往返不失真，且链接很短（差异为空）", () => {
    const base = baselineFor("TH", "tiktok-shop");
    const token = encodeShareState(base, "TH", "tiktok-shop");
    expect(token.length).toBeLessThan(80); // 只剩 v/c/p 三个字段

    const decoded = decodeShareState(token);
    expect(decoded).not.toBeNull();
    expect(decoded!.countryCode).toBe("TH");
    expect(decoded!.platformId).toBe("tiktok-shop");
    expect(decoded!.data).toEqual(base);
  });

  it("用户改过的数字能完整带过去", () => {
    const base = baselineFor("TH", "tiktok-shop");
    const edited = {
      ...base,
      price: 399,
      purchaseCost: 55.5,
      commissionRate: 12.34,
      vatIncluded: false,
      category: "pet_heavy",
    };
    const decoded = decodeShareState(encodeShareState(edited, "TH", "tiktok-shop"));
    expect(decoded!.data.price).toBe(399);
    expect(decoded!.data.purchaseCost).toBe(55.5);
    expect(decoded!.data.commissionRate).toBe(12.34);
    expect(decoded!.data.vatIncluded).toBe(false);
    expect(decoded!.data.category).toBe("pet_heavy");
    // 没动过的字段仍取该国默认值
    expect(decoded!.data.transactionRate).toBe(base.transactionRate);
  });

  it("平台费目原始值随链接一起走（否则 UI 显示与引擎脱节）", () => {
    const base = baselineFor("TH", "tiktok-shop");
    const edited = {
      ...base,
      platformFeeValues: { commission: 9.9, transaction: 3.21, growth: 8.03, infrastructure: 1.07 },
    };
    const decoded = decodeShareState(encodeShareState(edited, "TH", "tiktok-shop"));
    expect(decoded!.data.platformFeeValues?.commission).toBe(9.9);
  });

  it("换国家换平台也带得对：VN × Shopee 解出来的是 VN 的基线", () => {
    const base = baselineFor("VN", "shopee");
    const edited = { ...base, price: 599000 };
    const decoded = decodeShareState(encodeShareState(edited, "VN", "shopee"));
    expect(decoded!.countryCode).toBe("VN");
    expect(decoded!.platformId).toBe("shopee");
    expect(decoded!.data.price).toBe(599000);
    expect(decoded!.data.rate).toBe(getCountry("VN").defaultRate);
  });

  it("坏 token 一律返回 null，不抛异常", () => {
    expect(decodeShareState(null)).toBeNull();
    expect(decodeShareState("")).toBeNull();
    expect(decodeShareState("!!!not-base64!!!")).toBeNull();
    expect(decodeShareState(toBase64Url("not json"))).toBeNull();
    // 版本不符（将来结构变了，老链接要安全失效）
    expect(decodeShareState(toBase64Url(JSON.stringify({ v: 99, c: "TH", p: "tiktok-shop", d: {} })))).toBeNull();
    // 未知国家 / 未知平台
    expect(decodeShareState(tokenFor("XX" as CountryCode, "tiktok-shop", {}))).toBeNull();
    expect(decodeShareState(tokenFor("TH", "lazada" as PlatformId, {}))).toBeNull();
    // 超长 token 直接拒绝
    expect(decodeShareState("A".repeat(5000))).toBeNull();
  });

  it("手改 URL 塞脏数据不会污染输入", () => {
    const base = baselineFor("TH", "tiktok-shop");
    const token = tokenFor("TH", "tiktok-shop", {
      price: "not-a-number", // 类型不符 → 忽略
      purchaseCost: -0, // 数字 → 接受
      unknownField: 123, // 未知字段 → 忽略
      vatIncluded: "yes", // 类型不符 → 忽略
    });
    const decoded = decodeShareState(token);
    expect(decoded).not.toBeNull();
    expect(decoded!.data.price).toBe(base.price);
    expect(decoded!.data.vatIncluded).toBe(base.vatIncluded);
    expect((decoded!.data as unknown as Record<string, unknown>).unknownField).toBeUndefined();
  });

  it("地址栏读写：能取出参数、也能清掉参数", () => {
    expect(readShareToken("?s=abc")).toBe("abc");
    expect(readShareToken("?a=1&s=xyz&b=2")).toBe("xyz");
    expect(readShareToken("")).toBeNull();
    expect(readShareToken("?other=1")).toBeNull();

    const url = buildShareUrl("https://example.com/profit-os/?a=1", "tok");
    expect(url).toContain("s=tok");
    expect(url).toContain("a=1");
    expect(stripShareParam(url)).not.toContain("s=tok");
    expect(stripShareParam(url)).toContain("a=1");
  });

  it("base64url 只产生 URL 安全字符", () => {
    const token = toBase64Url(JSON.stringify({ hello: "世界/+=?", n: 1 }));
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(fromBase64Url(token)).toBe(JSON.stringify({ hello: "世界/+=?", n: 1 }));
  });
});
