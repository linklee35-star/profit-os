import { D, round2, safeDiv } from "./calculations";
import type { ComputedCosts } from "./fee-engine";
import type {
  HealthLevel,
  ProfitInput,
} from "./types";

// ============================================================================
// pricing-engine —— 负责「定价与指标推导」
// 保本 CPA / 保本 ROAS / 保本售价 / 利润率 / ROI / 健康度 / 目标定价
// ============================================================================

/** 利润健康度分级 */
export function computeHealth(margin: number): HealthLevel {
  if (margin < 0) return "danger";
  if (margin < 10) return "warning";
  if (margin <= 25) return "healthy";
  return "excellent";
}

export interface PricingResult {
  netProfit: number;
  profitMargin: number;
  roi: number;
  breakEvenCPA: number;
  breakEvenROAS: number;
  breakEvenPrice: number;
  health: HealthLevel;
  suggestedPrice: number;
  buyerTotalCost: number;
}

/** 建议售价：按目标净利润反推 */
export function suggestPriceByProfit(
  costs: ComputedCosts,
  targetProfit: number,
): number {
  if (costs.rateFraction >= 1) return 0;
  return round2(
    D(targetProfit).plus(costs.fixedCost).div(D(1).minus(costs.rateFraction)),
  );
}

/** 建议售价：按目标利润率反推 */
export function suggestPriceByMargin(
  costs: ComputedCosts,
  targetMargin: number,
): number {
  const marginRatio = D(targetMargin).div(100);
  const divisor = D(1).minus(costs.rateFraction).minus(marginRatio);
  if (divisor.lte(0)) return 0;
  return round2(D(costs.fixedCost).div(divisor));
}

/** 根据用户输入模式计算建议售价 */
export function computeSuggestedPrice(input: ProfitInput, costs: ComputedCosts): number {
  if (input.targetPricingMode === "profit" && input.targetProfit > 0) {
    return suggestPriceByProfit(costs, input.targetProfit);
  }
  if (input.targetPricingMode === "margin" && input.targetMargin > 0) {
    return suggestPriceByMargin(costs, input.targetMargin);
  }
  return 0;
}

/**
 * 根据成本与售价推导各项指标。
 */
export function computePricing(
  costs: ComputedCosts,
  price: number,
  input: ProfitInput,
): PricingResult {
  const p = D(price);
  const total = D(costs.totalCost);

  const netProfit = round2(p.minus(total));
  const profitMargin = round2(safeDiv(netProfit, price) * 100);
  const roi = round2(safeDiv(netProfit, costs.totalCost) * 100);

  const breakEvenCPA = round2(p.minus(D(costs.totalCostExclAd)));
  const breakEvenROAS = round2(safeDiv(price, breakEvenCPA));

  let breakEvenPrice = 0;
  if (costs.rateFraction < 1) {
    breakEvenPrice = round2(D(costs.fixedCost).div(D(1).minus(costs.rateFraction)));
  }

  const suggestedPrice = computeSuggestedPrice(input, costs);

  return {
    netProfit,
    profitMargin,
    roi,
    breakEvenCPA,
    breakEvenROAS,
    breakEvenPrice,
    health: computeHealth(profitMargin),
    suggestedPrice,
    buyerTotalCost: costs.buyerTotalCost,
  };
}

/** 健康度对应文案与配色 */
export const HEALTH_META: Record<
  HealthLevel,
  { label: string; tone: "danger" | "warning" | "success"; desc: string }
> = {
  danger: { label: "亏损", tone: "danger", desc: "利润率 < 0%，每卖一单都在亏" },
  warning: { label: "偏低", tone: "warning", desc: "利润率 0%–10%，抗风险能力弱" },
  healthy: { label: "健康", tone: "success", desc: "利润率 10%–25%，运营良好" },
  excellent: { label: "优秀", tone: "success", desc: "利润率 > 25%，利润空间充足" },
};

export type { ProfitInput };
