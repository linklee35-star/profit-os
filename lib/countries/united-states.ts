import type { CountryConfig } from "@/lib/types";

// ============================================================================
// 美国 —— 国家层配置（与平台无关的参数）
// 平台费率已迁移至数据层：lib/fees/amazon-us.ts
// ============================================================================

export const unitedStates: CountryConfig = {
  code: "US",
  name: "美国",
  enName: "United States",
  flag: "🇺🇸",
  currency: "USD",
  currencySymbol: "$",
  defaultRate: 0.15015, // 1 CNY ≈ 0.15015 USD（Frankfurter/ECB 2026-11-26 参考价，可手动/自动更新）
  samplePrice: 29.9, // 示例售价 $29.9（美国站常见客单价带）
  // 美国无联邦 VAT：销售税由平台在结算时向买家代收，卖家侧成本默认不计
  vat: 0,
  taxName: "Sales Tax",
  taxNote: "美国无联邦 VAT；销售税由平台代收，卖家侧默认不计",
  dutyNote: "进口关税按品类另计，2025-08 起 de minimis 免税已收紧，以最新海关公告为准",
};

export default unitedStates;
