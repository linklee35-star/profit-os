import type { CountryConfig, PlatformId, ProfitInput } from "./types";
import { getCountry } from "./countries";
import { getPlatform } from "./platforms";
import { getPlatformFees } from "./fees";
import { D, round2 } from "./calculations";

// ============================================================================
// 统一默认值 —— 所有「高级成本」默认为 0（未填写不参与计算）
// 快速模式只显示核心字段；真实模式显示全部（默认 0）
// 物流默认值基于 2026 年中国→泰国跨境电商货代真实报价（跨境小包专线）
// 平台费率基于 TikTok Shop 泰国 2026-05-06 后最新公告
// ============================================================================

export const DEFAULT_INPUT: ProfitInput = {
  // 商品成本（RMB）核心
  purchaseCost: 25,
  domesticShipping: 2,
  packagingCost: 1.5,
  intlShipping: 9.7, // 由 weightGrams × shippingRatePerKg + handling 推导（0.35kg × 22 + 2）
  otherCost: 0,

  // 真实物流（货代报价，2026 年中国→泰国跨境小包专线约 ¥18–35/kg）
  weightGrams: 350,
  shippingRatePerKg: 22,
  shippingHandling: 2,
  logisticsMode: "weight",

  rate: 5.0,

  price: 299,

  category: "default",

  // 平台费用（Post-2026-05-06 非Mall通用类目）
  commissionRate: 7.49,
  transactionRate: 3.21,
  growthRate: 8.03,
  infrastructureFee: 1.07,

  // 达人
  influencerCommissionRate: 10,
  influencerFixedFeeRMB: 0,
  influencerSampleFeeRMB: 0,
  influencerSampleShippingRMB: 0,

  // 广告
  adMode: "cpa",
  cpa: 30,
  adSpend: 0,
  adOrders: 0,
  adCreativeCost: 0,
  adAgencyFee: 0,
  adProductionCost: 0,
  adAmortizeOrders: 1,

  // 物流风险
  returnRate: 5,
  rejectRate: 1,
  lostRate: 0.5,
  compRate: 0.5,

  // 税务
  vatRate: 7,
  vatIncluded: false,
  importDutyRate: 0,
  customsFee: 0,
  taxServiceFee: 0,

  // 进口关税（2026年起泰国取消1500铢免税额）
  dutyEnabled: false,
  dutyCategory: "general",
  dutyRate: 10,

  // 目标定价
  targetPricingMode: "profit",
  targetProfit: 0,
  targetMargin: 20,

  // 收款
  withdrawFeeRate: 0.5,
  platformFeeRate: 1,
  fxLossRate: 0.3,

  // 仓储
  storageFee: 0,
  localWarehouseHandling: 0,
  packagingLabor: 0,
  orderProcessingFee: 0,

  // 团队
  csCost: 0,
  opsCost: 0,
  softwareCost: 0,
  officeCost: 0,
  teamAmortizeOrders: 1,

  // 模块开关
  logisticsEnabled: true,
  adEnabled: true,
  influencerEnabled: true,
};

/**
 * 由「重量 × 货代单价 + 固定操作费」推导国际物流成本。
 */
export function deriveLogistics(input: ProfitInput): ProfitInput {
  if (input.logisticsMode === "manual") return input;
  if (input.weightGrams > 0 && input.shippingRatePerKg >= 0) {
    const derived = round2(
      D(input.weightGrams).div(1000).times(input.shippingRatePerKg).plus(input.shippingHandling),
    );
    return { ...input, intlShipping: derived };
  }
  return input;
}

/** 用国家配置 + 平台费率覆盖默认值（平台缺数据时保持内置默认） */
export function applyCountryDefaults(
  input: ProfitInput,
  country: CountryConfig,
  platformId: PlatformId = "tiktok-shop",
): ProfitInput {
  const fees = getPlatformFees(platformId, country.code);
  const platform = getPlatform(platformId);
  const platformInput =
    fees && platform.mapToInput ? platform.mapToInput(fees.values) : {};
  return {
    ...input,
    ...platformInput,
    vatRate: country.vat,
    rate: country.defaultRate,
  };
}

/** 初次构建：以默认输入 + 指定国家/平台默认 */
export function buildInitialInput(
  countryCode: CountryConfig["code"],
  platformId: PlatformId = "tiktok-shop",
): ProfitInput {
  return applyCountryDefaults(DEFAULT_INPUT, getCountry(countryCode), platformId);
}
