import type { PlatformFeeSchema, ProfitInput } from "../types";

// ============================================================================
// Shopee 平台层 schema —— 电商模型第二个平台
// 费目结构（以 Shopee 东南亚跨境店通用费目为准）：
//   佣金 Commission / 交易手续费 Transaction Fee / 服务费 Service Fee
// 具体费率见数据层 lib/fees/shopee-*.ts（必须带来源 + 生效日期）
// ============================================================================

export const shopee: PlatformFeeSchema = {
  id: "shopee",
  name: "Shopee",
  model: "ecommerce",
  feeFields: [
    {
      key: "commission",
      labelZh: "佣金",
      labelEn: "Commission",
      unit: "percent",
      formula: "price-based",
      note: "按类目与卖家类型（普通/Mall）差异大，以卖家中心费率表为准",
    },
    {
      key: "transaction",
      labelZh: "交易手续费",
      labelEn: "Transaction Fee",
      unit: "percent",
      formula: "price-based",
      note: "支付通道费，按订单实付金额计",
    },
    {
      key: "service",
      labelZh: "服务费",
      labelEn: "Service Fee",
      unit: "percent",
      formula: "price-based",
      note: "部分站点/卖家类型收取（如免运计划服务费），默认 0",
    },
  ],
  // 平台费目值 → 电商模型输入字段（模型层契约）
  // 说明：当前输入模型（ProfitInput）沿用 TikTok 四槽位（佣金/交易费/增长费/基础设施费），
  // Shopee 的 service 映射到 growthRate 槽位（同属"按售价百分比的附加平台费"），
  // 待动态费目表单落地后改为按 schema 动态承载
  mapToInput(values: Record<string, number>): Partial<ProfitInput> {
    return {
      commissionRate: values.commission ?? 0,
      transactionRate: values.transaction ?? 0,
      growthRate: values.service ?? 0,
      infrastructureFee: 0, // Shopee 无按单固定基础设施费
    };
  },
};

export default shopee;
