import type { CategoryTemplate, ProfitInput } from "./types";

// ============================================================================
// 品类模板 —— 选择后一键预填「最新真实参考费率」
// 物流单价基于 2026 年中国→泰国跨境电商货代报价
// 平台费基于 TikTok 泰国 2026-05-06 后规则（非Mall 通用）
// ============================================================================

export const CATEGORIES: CategoryTemplate[] = [
  {
    id: "default",
    name: "通用基准",
    desc: "不套用特定品类，使用默认参数",
    patch: {},
  },
  {
    id: "pet_light",
    name: "宠物轻小件",
    desc: "玩具 / 服饰 / 牵引绳 / 项圈等，约 200g",
    patch: {
      weightGrams: 200,
      shippingRatePerKg: 22,
      shippingHandling: 2,
      commissionRate: 7.49,
      transactionRate: 3.21,
      growthRate: 8.03,
      returnRate: 8,
      influencerCommissionRate: 12,
      dutyCategory: "general",
      dutyRate: 10,
    },
  },
  {
    id: "pet_heavy",
    name: "宠物重货 / 用品",
    desc: "食盆 / 猫砂盆 / 笼具 / 家具等，约 1.2kg",
    patch: {
      weightGrams: 1200,
      shippingRatePerKg: 20,
      shippingHandling: 3,
      commissionRate: 7.49,
      transactionRate: 3.21,
      growthRate: 8.03,
      returnRate: 3,
      influencerCommissionRate: 10,
      dutyCategory: "general",
      dutyRate: 10,
    },
  },
  {
    id: "pet_consumable",
    name: "宠物食品 / 消耗品",
    desc: "零食 / 猫砂 / 湿粮等，约 1.5kg，复购高退货低",
    patch: {
      weightGrams: 1500,
      shippingRatePerKg: 18,
      shippingHandling: 3,
      commissionRate: 7.49,
      transactionRate: 3.21,
      growthRate: 8.03,
      returnRate: 2,
      influencerCommissionRate: 8,
      dutyCategory: "fashion",
      dutyRate: 30,
    },
  },
  {
    id: "pet_electronic",
    name: "宠物智能电器",
    desc: "饮水机 / 喂食器 / 摄像头等带电敏感货，约 800g",
    patch: {
      weightGrams: 800,
      shippingRatePerKg: 24,
      shippingHandling: 3,
      commissionRate: 6.955, // 电子类佣金 6.955%
      transactionRate: 3.21,
      growthRate: 6.96, // 电子类增长费 6.96%
      returnRate: 5,
      influencerCommissionRate: 15,
      dutyCategory: "electronics",
      dutyRate: 10,
    },
  },
];

export function getCategory(id: string): CategoryTemplate {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}

export function applyCategory(input: ProfitInput, id: string): ProfitInput {
  const cat = getCategory(id);
  return { ...input, ...cat.patch, category: id, logisticsMode: "weight" };
}
