import type { CountryConfig } from "@/lib/types";

// ============================================================================
// 泰国 —— 国家层配置（与平台无关的参数）
// 平台费率已迁移至数据层：lib/fees/tiktok-shop-th.ts
// ============================================================================

export const thailand: CountryConfig = {
  code: "TH",
  name: "泰国",
  enName: "Thailand",
  flag: "🇹🇭",
  currency: "THB",
  currencySymbol: "฿",
  defaultRate: 5.0, // 1 CNY ≈ 5 THB（参考值，可手动/自动更新）
  vat: 7.0, // 泰国 VAT 7%
};

export default thailand;
