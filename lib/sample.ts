import type { BatchRow, SkuItem } from "./types";

// ============================================================================
// 示例数据 —— 开箱即用，帮助用户快速理解系统
// ============================================================================

export const SAMPLE_SKUS: Omit<SkuItem, "id" | "createdAt">[] = [
  {
    sku: "PET-001",
    name: "宠物自动饮水机 2L",
    purchaseCost: 28,
    domesticShipping: 2.5,
    packagingCost: 2,
    intlShipping: 22,
    otherCost: 0,
    price: 299,
    cpa: 35,
    influencerCommissionRate: 10,
    note: "主推爆品，重量 0.8kg",
  },
  {
    sku: "PET-002",
    name: "猫咪电动逗猫球",
    purchaseCost: 12,
    domesticShipping: 1.5,
    packagingCost: 1,
    intlShipping: 14,
    otherCost: 0,
    price: 159,
    cpa: 20,
    influencerCommissionRate: 8,
    note: "轻小件，物流成本低",
  },
  {
    sku: "PET-003",
    name: "狗狗磨牙咬胶 100g",
    purchaseCost: 9,
    domesticShipping: 1,
    packagingCost: 0.8,
    intlShipping: 9,
    otherCost: 0,
    price: 99,
    cpa: 15,
    influencerCommissionRate: 5,
    note: "食品类，注意清关",
  },
  {
    sku: "PET-004",
    name: "宠物毛发梳 双面",
    purchaseCost: 6,
    domesticShipping: 1,
    packagingCost: 0.6,
    intlShipping: 7,
    otherCost: 0,
    price: 69,
    cpa: 10,
    influencerCommissionRate: 5,
    note: "测品阶段",
  },
];

export const SAMPLE_BATCH: BatchRow[] = [
  { sku: "PET-001", name: "宠物自动饮水机 2L", purchaseCost: 28, logisticsCost: 24.5, price: 299, cpa: 35, influencerCommissionRate: 10 },
  { sku: "PET-002", name: "猫咪电动逗猫球", purchaseCost: 12, logisticsCost: 15.5, price: 159, cpa: 20, influencerCommissionRate: 8 },
  { sku: "PET-003", name: "狗狗磨牙咬胶 100g", purchaseCost: 9, logisticsCost: 10, price: 99, cpa: 15, influencerCommissionRate: 5 },
  { sku: "PET-004", name: "宠物毛发梳 双面", purchaseCost: 6, logisticsCost: 8, price: 69, cpa: 10, influencerCommissionRate: 5 },
  { sku: "PET-005", name: "宠物指甲剪 安全型", purchaseCost: 7, logisticsCost: 9, price: 89, cpa: 12, influencerCommissionRate: 6 },
  { sku: "PET-006", name: "猫咪猫爬架 小型", purchaseCost: 45, logisticsCost: 60, price: 599, cpa: 70, influencerCommissionRate: 12 },
];
