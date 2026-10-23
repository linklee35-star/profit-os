import type { CountryConfig } from "@/lib/types";

// ============================================================================
// 越南 —— 国家层配置（与平台无关的参数）
// 平台费率已迁移至数据层：lib/fees/tiktok-shop-vn.ts
// ============================================================================

export const vietnam: CountryConfig = {
  code: "VN",
  name: "越南",
  enName: "Vietnam",
  flag: "🇻🇳",
  currency: "VND",
  currencySymbol: "₫",
  defaultRate: 3500, // 1 CNY ≈ 3,500 VND（参考值，可手动/自动更新）
  samplePrice: 299000, // 示例售价 ₫299,000（约 ¥85，越南站常见客单价带）
  vat: 10, // 越南标准 VAT 10%（2024-2026H1 曾执行 8% 优惠税率，以最新政策为准）
};

export default vietnam;
