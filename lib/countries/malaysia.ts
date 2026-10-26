import type { CountryConfig } from "@/lib/types";

// ============================================================================
// 马来西亚 —— 国家层配置（与平台无关的参数）
// 平台费率已迁移至数据层：lib/fees/tiktok-shop-my.ts
// ============================================================================

export const malaysia: CountryConfig = {
  code: "MY",
  name: "马来西亚",
  enName: "Malaysia",
  flag: "🇲🇾",
  currency: "MYR",
  currencySymbol: "RM",
  defaultRate: 0.6, // 1 CNY ≈ 0.6 MYR（参考值，可手动/自动更新）
  samplePrice: 59, // 示例售价 RM59（马来站常见客单价带）
  // 马来西亚不对售价征 VAT：SST 8% 只作用于平台服务费（已含在费率内），
  // 低价值商品税（LVG 10%，RM500 以下）由平台向买家代收，卖家侧不计
  vat: 0,
};

export default malaysia;
