import type { PlatformFeeSchema, ProfitInput } from "../types";

// ============================================================================
// TikTok Shop 平台层 schema —— 电商模型第一个平台
// 新增平台：复制本文件改费目定义即可，引擎与数据层无需改动
// ============================================================================

export const tiktokShop: PlatformFeeSchema = {
  id: "tiktok-shop",
  name: "TikTok Shop",
  model: "ecommerce",
  feeFields: [
    {
      key: "commission",
      labelZh: "佣金",
      labelEn: "Commission",
      unit: "percent",
      formula: "price-based",
      note: "非Mall通用类目与电子类目不同，Mall 另计",
    },
    {
      key: "transaction",
      labelZh: "交易手续费",
      labelEn: "Transaction Fee",
      unit: "percent",
      formula: "price-based",
      note: "含税，基准含平台折扣",
    },
    {
      key: "growth",
      labelZh: "电商增长服务费",
      labelEn: "Growth Service Fee",
      unit: "percent",
      formula: "price-based",
      advanced: true,
    },
    {
      key: "infrastructure",
      labelZh: "基础设施费",
      labelEn: "Infrastructure Fee",
      unit: "fixed",
      formula: "per-order",
      note: "฿/单，含税",
      advanced: true,
    },
  ],
  // 平台费目值 → 电商模型输入字段（模型层契约）
  mapToInput(values: Record<string, number>): Partial<ProfitInput> {
    return {
      commissionRate: values.commission ?? 0,
      transactionRate: values.transaction ?? 0,
      growthRate: values.growth ?? 0,
      infrastructureFee: values.infrastructure ?? 0,
    };
  },
};

export default tiktokShop;
