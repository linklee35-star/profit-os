import { describe, expect, it } from "vitest";
import { applyCountryDefaults, DEFAULT_INPUT } from "../lib/schema";
import { getCountry } from "../lib/countries";
import { getPlatformFees, feeData } from "../lib/fees";
import { getPlatform, platforms } from "../lib/platforms";
import type { CountryCode } from "../lib/types";

// ============================================================================
// 国家 × 平台 默认值接线测试 —— 防止「加了国家/费率数据但没接上」的回归
// ============================================================================

describe("国家 × 平台 默认值接线", () => {
  it("每个已注册国家都有 tiktok-shop 费率数据", () => {
    for (const code of ["TH", "VN", "MY"] as CountryCode[]) {
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

  it("马来西亚默认值来自数据层（2026-06 费率）", () => {
    const input = applyCountryDefaults(DEFAULT_INPUT, getCountry("MY"));
    expect(input.commissionRate).toBe(9.7); // 非Mall 子类目区间中点
    expect(input.transactionRate).toBe(4.32); // 2026-06 起（原 3.78%）
    expect(input.growthRate).toBe(0); // 马来站无此项
    expect(input.infrastructureFee).toBe(0.54); // 平台支持费 RM/单（含 SST）
    expect(input.vatRate).toBe(0); // 不对售价征 VAT
    expect(input.rate).toBe(0.6);
    expect(input.price).toBe(59);
  });

  it("平台费目原始值随国家默认值写入（schema 驱动 UI 的数据源）", () => {
    const th = applyCountryDefaults(DEFAULT_INPUT, getCountry("TH"));
    expect(th.platformFeeValues).toMatchObject({
      commission: 7.49,
      transaction: 3.21,
      growth: 8.03,
      infrastructure: 1.07,
    });
    const my = applyCountryDefaults(DEFAULT_INPUT, getCountry("MY"));
    expect(my.platformFeeValues?.commission).toBe(9.7);
    // 原始值经 mapToInput 后与引擎槽位一致（两套数据不脱节）
    const mapped = getPlatform("tiktok-shop").mapToInput!(my.platformFeeValues!);
    expect(mapped.commissionRate).toBe(my.commissionRate);
    expect(mapped.transactionRate).toBe(my.transactionRate);
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

  it("每个平台 schema 结构完整且映射可用", () => {
    for (const platform of platforms) {
      expect(platform.id.length).toBeGreaterThan(0);
      expect(platform.model).toBe("ecommerce");
      expect(platform.feeFields.length).toBeGreaterThan(0);
      // 费目 key 唯一
      const keys = platform.feeFields.map((f) => f.key);
      expect(new Set(keys).size).toBe(keys.length);
      // mapToInput 对空值也应可用（缺数据时不应抛错）
      if (platform.mapToInput) {
        const mapped = platform.mapToInput({});
        expect(typeof mapped).toBe("object");
      }
    }
  });
});
