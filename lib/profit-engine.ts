import { computeCosts } from "./fee-engine";
import { computePricing } from "./pricing-engine";
import { deriveLogistics } from "./schema";
import type { ProfitInput, ProfitResult } from "./types";

// ============================================================================
// profit-engine —— 唯一对外计算入口
// 页面 / store / 批测 全部只调用 calculateProfit()
// ============================================================================

/** 核心函数：给定统一输入，返回完整利润结果 */
export function calculateProfit(input: ProfitInput): ProfitResult {
  const derived = deriveLogistics(input);
  const costs = computeCosts(derived);
  const pricing = computePricing(costs, derived.price, derived);
  return {
    productCostRMB: costs.productCostRMB,
    productCost: costs.productCostTHB,
    price: derived.price,
    breakdown: costs.breakdown,
    totalCost: costs.totalCost,
    totalCostExclAd: costs.totalCostExclAd,
    ...pricing,
  };
}

export function calculateProfitAtPrice(
  input: ProfitInput,
  price: number,
): number {
  return calculateProfit({ ...input, price }).netProfit;
}

export { computeCosts, computeAdCost, computeImportDuty, computeCifTHB } from "./fee-engine";
export { computeHealth, HEALTH_META, suggestPriceByProfit, suggestPriceByMargin, computeSuggestedPrice } from "./pricing-engine";
