import { describe, expect, it } from "vitest";
import { applyCountryDefaults, DEFAULT_INPUT } from "../lib/schema";
import { getCountry, countries } from "../lib/countries";
import { getPlatformFees, getPlatformsForCountry, feeData } from "../lib/fees";
import { getPlatform, platforms } from "../lib/platforms";
import type { CountryCode } from "../lib/types";

// ============================================================================
// Amazon US 接线测试 —— 防止「加了平台/国家但没接上」的回归
// ============================================================================

describe("Amazon 美国站接线", () => {
  it("美国已注册进国家表，默认参数来自数据层", () => {
    expect(countries.map((c) => c.code)).toContain("US");
    const us = getCountry("US");
    expect(us.currency).toBe("USD");
    expect(us.currencySymbol).toBe("$");
    expect(us.vat).toBe(0); // 美国无联邦 VAT，销售税由平台代收
    expect(us.taxName).toBe("Sales Tax");
  });

  it("美国站默认输入：15% 佣金、无 VAT、汇率取数据层", () => {
    const input = applyCountryDefaults(DEFAULT_INPUT, getCountry("US"), "amazon");
    expect(input.commissionRate).toBe(15);
    expect(input.transactionRate).toBe(0);
    expect(input.growthRate).toBe(0);
    expect(input.infrastructureFee).toBe(0);
    expect(input.vatRate).toBe(0);
    expect(input.rate).toBe(0.15015);
    expect(input.price).toBe(29.9);
  });

  it("美国站费率数据带来源与生效日期，且费目与 schema 一致", () => {
    const fees = getPlatformFees("amazon", "US");
    expect(fees).toBeDefined();
    expect(fees!.source).toContain("sell.amazon.com");
    expect(fees!.effectiveFrom).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const schemaKeys = getPlatform("amazon").feeFields.map((f) => f.key);
    for (const k of Object.keys(fees!.values)) {
      expect(schemaKeys).toContain(k);
    }
  });

  it("国家→平台列表：只有美国提供 Amazon，东南亚国家不误接", () => {
    expect(getPlatformsForCountry("US")).toEqual(["amazon"]);
    for (const code of ["TH", "VN", "MY"] as CountryCode[]) {
      expect(getPlatformsForCountry(code)).not.toContain("amazon");
    }
  });

  it("平台注册表完整，Amazon schema 映射可用", () => {
    expect(platforms.map((p) => p.id)).toContain("amazon");
    const platform = getPlatform("amazon");
    expect(platform.mapToInput!({ referral: 15, closing: 1.8 })).toMatchObject({
      commissionRate: 15,
      infrastructureFee: 1.8,
      transactionRate: 0,
      growthRate: 0,
    });
    expect(platform.mapToInput!({})).toMatchObject({ commissionRate: 0 });
  });

  it("费率注册表双向一致：Amazon 每条数据的费目都在 schema 内", () => {
    for (const f of feeData.filter((x) => x.platform === "amazon")) {
      const schema = getPlatform(f.platform);
      for (const field of schema.feeFields) {
        expect(typeof f.values[field.key], `${f.country} 缺费目 ${field.key}`).toBe("number");
      }
    }
  });

  it("切到美国再切回泰国，费率不串台", () => {
    const us = applyCountryDefaults(DEFAULT_INPUT, getCountry("US"), "amazon");
    expect(us.commissionRate).toBe(15);
    const th = applyCountryDefaults(us, getCountry("TH"), "tiktok-shop");
    expect(th.commissionRate).toBe(7.49);
    expect(th.currencySymbol ?? getCountry("TH").currencySymbol).toBe("฿");
  });
});
