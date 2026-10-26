import type { PlatformCountryFees } from "../types";

// ============================================================================
// TikTok Shop 泰国站费率数据 —— 平台 × 国家 数据层
// 数据规范（社区 PR 同规，评审用）：
//   1. 必须带 source（官方公告 / 可追溯的第三方汇总）
//   2. 必须带 effectiveFrom（费率生效日期）
//   3. 变更写进 notes，保留旧值注释（可追溯每一次调价）
// ============================================================================

export const tiktokShopTH: PlatformCountryFees = {
  platform: "tiktok-shop",
  country: "TH",
  effectiveFrom: "2026-05-06",
  source: "TikTok Shop 卖家中心官方公告 + tiktokshopcalc.one 汇总",
  notes:
    "2026年4月1日涨佣 + 2026年5月6日涨增长费 后实况（非Mall通用类目）；" +
    "电子类目佣金 6.955%、增长费 6.96%，Mall 佣金 10.7%+，均未采用",
  values: {
    commission: 7.49, // 非Mall通用佣金 7.49%（电子 6.955%，Mall 10.7%+）
    transaction: 3.21, // 交易手续费 3.21%（含税，基准含平台折扣）
    growth: 8.03, // 电商增长服务费 8.03%（电子 6.96%）
    infrastructure: 1.07, // 基础设施费 ฿1.07/单（含税）
  },
};

export default tiktokShopTH;
