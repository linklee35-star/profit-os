import { D, sum, pct, round2, amortize } from "./calculations";
import type { CostBreakdown, ProfitInput } from "./types";
import Decimal from "decimal.js";

// ============================================================================
// fee-engine —— 负责「各项成本怎么算」
// 平台 / 达人 / 广告 / 关税 / 物流风险 / 税务 / 收款 / 仓储 / 团队
// 所有金额统一换算为目标币种（THB 等），以 decimal.js 保证精度
// 算法基于 TikTok Shop 泰国站 2026 年 5 月后最新规则
// ============================================================================

export interface ComputedCosts {
  productCostRMB: number;
  productCostTHB: number;
  breakdown: CostBreakdown;
  totalCost: number; // 卖家全部成本（不含关税——关税由买家承担）
  totalCostExclAd: number; // 除广告外的卖家成本
  buyerTotalCost: number; // 买家应付总额 = 售价 + VAT + 关税
  rateFraction: number; // 所有「按售价百分比」成本系数之和
  fixedCost: number; // 固定/换算成本 = totalCost - price × rateFraction
  cifTHB: number; // CIF 到岸成本（THB），关税计算基数
}

/** 广告费用 */
export function computeAdCost(input: ProfitInput): number {
  if (input.adEnabled === false) return 0;
  let primary = D(0);
  if (input.adMode === "cpa") {
    primary = D(input.cpa);
  } else {
    const orders = D(input.adOrders);
    primary = orders.gt(0) ? D(input.adSpend).div(orders) : D(0);
  }
  const advancedRaw = sum(
    input.adCreativeCost,
    input.adAgencyFee,
    input.adProductionCost,
  ).toNumber();
  const advanced = amortize(advancedRaw, input.adAmortizeOrders);
  return round2(primary.plus(advanced));
}

/** 计算进口关税（CIF × 税率，买家承担，仅作参考） */
export function computeImportDuty(input: ProfitInput, rate: Decimal): number {
  if (!input.dutyEnabled) return 0;
  const cifRMB = D(input.purchaseCost)
    .plus(input.domesticShipping)
    .plus(input.packagingCost)
    .plus(input.intlShipping);
  const cifTHB = cifRMB.times(rate);
  const duty = cifTHB.times(pct(input.dutyRate));
  return round2(duty);
}

/** 计算 CIF 到岸成本（THB） */
export function computeCifTHB(input: ProfitInput, rate: Decimal): number {
  const cifRMB = D(input.purchaseCost)
    .plus(input.domesticShipping)
    .plus(input.packagingCost)
    .plus(input.intlShipping);
  return round2(cifRMB.times(rate));
}

export function computeCosts(input: ProfitInput): ComputedCosts {
  const price = D(input.price);
  const rate = D(input.rate);

  // —— 商品成本（RMB→THB）——
  const productCostRMB = round2(
    sum(
      input.purchaseCost,
      input.domesticShipping,
      input.packagingCost,
      input.intlShipping,
      input.otherCost,
    ),
  );
  const productCostTHB = round2(D(productCostRMB).times(rate));

  // —— 平台费用 = 售价 × (佣金+交易费+增长费) + 基础设施费 ——
  // 2026年5月后：非Mall 佣金 7.49% + 交易费 3.21% + 增长费 8.03% + ฿1.07/单
  const platformRatePct = D(input.commissionRate)
    .plus(input.transactionRate)
    .plus(input.growthRate);
  const platformFee = round2(
    price.times(pct(platformRatePct.toNumber())).plus(D(input.infrastructureFee)),
  );

  // —— 达人费用 ——
  const influencerOn = input.influencerEnabled !== false;
  const influencerCommission = influencerOn
    ? round2(price.times(pct(input.influencerCommissionRate)))
    : 0;
  const influencerFixedTHB = influencerOn
    ? round2(
        sum(
          input.influencerFixedFeeRMB,
          input.influencerSampleFeeRMB,
          input.influencerSampleShippingRMB,
        ).times(rate),
      )
    : 0;
  const influencerFee = round2(D(influencerCommission).plus(influencerFixedTHB));

  // —— 广告费用 ——
  const adCost = computeAdCost(input);

  // —— 物流风险损耗 ——
  const logisticsOn = input.logisticsEnabled !== false;
  const logiPct = D(logisticsOn ? input.returnRate : 0)
    .plus(logisticsOn ? input.rejectRate : 0)
    .plus(logisticsOn ? input.lostRate : 0)
    .plus(logisticsOn ? input.compRate : 0);
  const logisticsLoss = round2(price.times(pct(logiPct.toNumber())));

  // —— 进口关税（CIF × 税率，买家承担，不计入卖家成本）——
  const importDutyCost = computeImportDuty(input, rate);

  // —— 税务成本（VAT = 售价 × 7%，价内税不重复扣）——
  // 泰国 VAT 7%，如售价已含税则不扣减
  const effectiveVat = input.vatIncluded ? 0 : input.vatRate;
  const vatCost = round2(price.times(pct(effectiveVat)));
  const taxCost = round2(
    D(vatCost).plus(D(input.customsFee)).plus(D(input.taxServiceFee)),
  );

  // —— 收款成本 ——
  const recvPct = D(input.withdrawFeeRate)
    .plus(input.platformFeeRate)
    .plus(input.fxLossRate);
  const receivingCost = round2(price.times(pct(recvPct.toNumber())));

  // —— 仓储成本 ——
  const warehouseCost = round2(
    sum(
      input.storageFee,
      input.localWarehouseHandling,
      input.packagingLabor,
      input.orderProcessingFee,
    ),
  );

  // —— 团队成本 ——
  const teamTotal = sum(
    input.csCost,
    input.opsCost,
    input.softwareCost,
    input.officeCost,
  ).toNumber();
  const teamCost = amortize(teamTotal, input.teamAmortizeOrders);

  const breakdown: CostBreakdown = {
    productCost: productCostTHB,
    platformFee,
    influencerFee,
    adCost,
    logisticsLoss,
    importDutyCost,
    taxCost,
    receivingCost,
    warehouseCost,
    teamCost,
  };

  // 卖家总成本（不含关税——关税由买家承担）
  const sellerCost = Object.entries(breakdown)
    .filter(([k]) => k !== "importDutyCost")
    .reduce<number>((a, [, v]) => a + v, 0);
  const totalCost = round2(sellerCost);
  const totalCostExclAd = round2(D(totalCost).minus(adCost));

  // 买家应付总额 = 售价 + VAT（若不含税）+ 关税
  const buyerTotalCost = round2(
    price.plus(D(vatCost)).plus(input.dutyEnabled ? D(importDutyCost) : 0),
  );

  // 百分比费率系数（不含固定成本部分 + 不含关税——关税不计入保本计算）
  const rateFractionPct = D(0)
    .plus(input.commissionRate)
    .plus(input.transactionRate)
    .plus(input.growthRate)
    .plus(input.influencerEnabled !== false ? input.influencerCommissionRate : 0)
    .plus(input.logisticsEnabled !== false ? input.returnRate : 0)
    .plus(input.logisticsEnabled !== false ? input.rejectRate : 0)
    .plus(input.logisticsEnabled !== false ? input.lostRate : 0)
    .plus(input.logisticsEnabled !== false ? input.compRate : 0)
    .plus(input.vatIncluded ? 0 : input.vatRate)
    .plus(input.withdrawFeeRate)
    .plus(input.platformFeeRate)
    .plus(input.fxLossRate);
  const rateFraction = pct(rateFractionPct.toNumber()).toNumber();

  const fixedCost = round2(D(totalCost).minus(price.times(rateFraction)));

  const cifTHB = computeCifTHB(input, rate);

  return {
    productCostRMB,
    productCostTHB,
    breakdown,
    totalCost,
    totalCostExclAd,
    buyerTotalCost,
    rateFraction,
    fixedCost,
    cifTHB,
  };
}
