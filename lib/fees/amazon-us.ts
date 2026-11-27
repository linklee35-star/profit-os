import type { PlatformCountryFees } from "../types";

// ============================================================================
// Amazon 美国站费率数据 —— 平台 × 国家 数据层
// 数据规范（社区 PR 同规，评审用）：
//   1. 必须带 source（官方公告 / 可追溯的第三方汇总）
//   2. 必须带 effectiveFrom（费率生效日期）
//   3. 变更写进 notes，保留旧值注释（可追溯每一次调价）
// ============================================================================

export const amazonUS: PlatformCountryFees = {
  platform: "amazon",
  country: "US",
  effectiveFrom: "2026-11-27",
  source: "Amazon 官方定价页 sell.amazon.com/pricing（Referral fees 表，2026-11-27 核对）",
  notes:
    "销售佣金按品类差异大：Everything Else 通用类目 15%（最低 $0.30/单）；" +
    "电子产品 8%、电脑 8%、服饰 ≤$15 为 5% / $15–20 为 10% / >$20 为 17%（2025-12-15 欧洲站下调，美国站以卖家中心为准）；" +
    "媒体类（图书/DVD/软件等）另收结账费 $1.80/单，默认按通用类目 15% 且 closing=0；" +
    "FBA 配送费与仓储费未纳入平台费目，请用物流 / 仓储模块自行填写；" +
    "卖家须按自身品类到卖家中心费率表核对，本默认值仅作快速估算",
  values: {
    referral: 15, // Everything Else 通用类目 15%
    closing: 0, // 非媒体类目无结账费
  },
};

export default amazonUS;
