import { describe, expect, it } from "vitest";
import { applyCountryDefaults, DEFAULT_INPUT } from "../lib/schema";
import { getCountry } from "../lib/countries";
import { getPlatformFees, feeData } from "../lib/fees";
import { getPlatform } from "../lib/platforms";
import type { CountryCode } from "../lib/types";

// ============================================================================
// 国家 × 平台 默认值接线测试 —— 防止「加了国家/费率数据但没接上」的回归
// ============================================================================

describe("国家 × 平台 默认值接线", () => {
  it("每个已注册国家都有 tiktok-shop 费率数据", () => {
    for (const code of ["TH", "VN"] as CountryCode[]) {
      const fees = getPlatformFees("tiktok-shop", code);
      expect(fees, `${code} 缺少费率数据`).toBeDefined();
      // 数据四规：来源 + 生效日期必须齐全（社区 PR 同规）
      expect(fees!.source.length).toBeGreaterThan(0);
      expect(fees!.effectiveFrom).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      // 数据层费目 key 必须与平台 schema 定义一致
      const schemaKeys = getPlatform("tiktok-shop").feeFields.map((f) => f.key);
      for (const k of Object.keys(fees!.values)) {
        expect(schemaKeys, `${code} 数据含 schema 未定义的费目: ${k}`).toContain(k);
      }
    }
  });

  it("泰国默认值来自数据层（2026-05-06 费率）", () => {
    const input = applyCountryDefaults(DEFAULT_INPUT, getCountry("TH"));
    expect(input.commissionRate).toBe(7.49);
    expect(input.transactionRate).toBe(3.21);
    expect(input.growthRate).toBe(8.03);
    expect(input.infrastructureFee).toBe(1.07);
    expect(input.vatRate).toBe(7);
    expect(input.rate).toBe(5);
    expect(input.price).toBe(299);
  });

  it("越南默认值来自数据层（2026-05-09 费率）", () => {
    const input = applyCountryDefaults(DEFAULT_INPUT, getCountry("VN"));
    expect(input.commissionRate).toBe(12.5);
    expect(input.transactionRate).toBe(6);
    expect(input.growthRate).toBe(0); // 越南站无增长服务费
    expect(input.infrastructureFee).toBe(3000); // ₫/单
    expect(input.vatRate).toBe(10);
    expect(input.rate).toBe(3500);
    expect(input.price).toBe(299000);
  });

  it("费率数据注册表与 schema 双向一致", () => {
    // 每条数据都能在 schema 里找到对应平台，且 schema 的费目数据里都有值
    for (const f of feeData) {
      const platform = getPlatform(f.platform);
      expect(platform).toBeDefined();
      for (const field of platform.feeFields) {
        expect(
          typeof f.values[field.key],
          `${f.platform}-${f.country} 缺少费目 ${field.key}`,
        ).toBe("number");
      }
    }
  });
});
