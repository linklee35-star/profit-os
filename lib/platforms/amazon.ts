import type { PlatformFeeSchema, ProfitInput } from "../types";

// ============================================================================
// Amazon 平台层 schema —— 电商模型第三个平台
// 费目结构（以 Amazon 卖家定价页为准）：
//   销售佣金 Referral Fee（按品类，Everything Else 15%）/ 媒体类结账费 Closing Fee
// FBA 配送费、仓储费不在平台费目内，走既有物流 / 仓储模块，避免重复计费
// 具体费率见数据层 lib/fees/amazon-us.ts（必须带来源 + 生效日期）
// ============================================================================

export const amazon: PlatformFeeSchema = {
  id: "amazon",
  name: "Amazon",
  model: "ecommerce",
  feeFields: [
    {
      key: "referral",
      labelZh: "销售佣金",
      labelEn: "Referral Fee",
      unit: "percent",
      formula: "price-based",
      note: "按品类，通用类目 15%（以卖家中心费目表为准）",
    },
    {
      key: "closing",
      labelZh: "结账费",
      labelEn: "Closing Fee",
      unit: "fixed",
      formula: "per-order",
      note: "媒体类 $1.80/单，其他类目 0",
      advanced: true,
    },
  ],
  // 平台费目值 → 电商模型输入字段（四个槽位全部显式写出，避免继承上一平台默认费率）
  mapToInput(values: Record<string, number>): Partial<ProfitInput> {
    return {
      commissionRate: values.referral ?? 0,
      transactionRate: 0, // Amazon 无独立交易手续费槽位
      growthRate: 0, // Amazon 无增长服务费
      infrastructureFee: values.closing ?? 0,
    };
  },
};

export default amazon;
