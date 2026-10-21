import type { CountryConfig } from "@/lib/types";

// 泰国站（TikTok Shop TH）默认配置 —— 2026 年 5 月 6 日后最新费率
// 来源：TikTok Shop 卖家中心官方公告 + tiktokshopcalc.one 汇总
export const thailand: CountryConfig = {
  code: "TH",
  name: "泰国",
  enName: "Thailand",
  flag: "🇹🇭",
  currency: "THB",
  currencySymbol: "฿",
  defaultRate: 5.0, // 1 CNY ≈ 5 THB（参考值，可手动/自动更新）
  platformFees: {
    // 2026年4月1日涨佣 + 2026年5月6日涨增长费 后实况（非Mall通用类目）
    commission: 7.49, // 非Mall通用佣金 7.49%（电子 6.955%，Mall 10.7%+）
    transaction: 3.21, // 交易手续费 3.21%（含税，基准含平台折扣）
    growth: 8.03, // 电商增长服务费 8.03%（电子 6.96%）
    infrastructure: 1.07, // 基础设施费 ฿1.07/单（含税）
  },
  vat: 7.0, // 泰国 VAT 7%
};

export default thailand;
