import { describe, it, expect } from "vitest";
import { calculateProfit } from "@/lib/profit-engine";
import { computeAdCost } from "@/lib/fee-engine";
import { amortize } from "@/lib/calculations";
import { DEFAULT_INPUT } from "@/lib/schema";
import { applyCategory } from "@/lib/categories";
import type { ProfitInput } from "@/lib/types";

function base(overrides: Partial<ProfitInput> = {}): ProfitInput {
  return {
    ...DEFAULT_INPUT,
    // 关掉所有高级成本，便于手算
    purchaseCost: 100,
    domesticShipping: 0,
    packagingCost: 0,
    intlShipping: 0,
    otherCost: 0,
    rate: 5,
    price: 1000,
    commissionRate: 5,
    transactionRate: 0,
    growthRate: 0,
    infrastructureFee: 0,
    influencerCommissionRate: 0,
    influencerFixedFeeRMB: 0,
    influencerSampleFeeRMB: 0,
    influencerSampleShippingRMB: 0,
    adMode: "cpa",
    cpa: 100,
    adSpend: 0,
    adOrders: 0,
    adCreativeCost: 0,
    adAgencyFee: 0,
    adProductionCost: 0,
    adAmortizeOrders: 1,
    returnRate: 0,
    rejectRate: 0,
    lostRate: 0,
    compRate: 0,
    vatRate: 0,
    importDutyRate: 0,
    customsFee: 0,
    taxServiceFee: 0,
    withdrawFeeRate: 0,
    platformFeeRate: 0,
    fxLossRate: 0,
    storageFee: 0,
    localWarehouseHandling: 0,
    packagingLabor: 0,
    orderProcessingFee: 0,
    csCost: 0,
    opsCost: 0,
    softwareCost: 0,
    officeCost: 0,
    teamAmortizeOrders: 1,
    // 测试基线：关闭按重量推导，沿用显式 intlShipping（保持旧断言不变）
    weightGrams: 0,
    shippingRatePerKg: 0,
    shippingHandling: 0,
    vatIncluded: false,
    category: "default",
    ...overrides,
  };
}

describe("profit-engine 核心计算", () => {
  it("基础场景：商品成本 + 平台费 + 广告", () => {
    const r = calculateProfit(base());
    expect(r.productCostRMB).toBe(100);
    expect(r.productCost).toBe(500); // 100 * 5
    expect(r.breakdown.platformFee).toBe(50); // 1000 * 5%
    expect(r.breakdown.adCost).toBe(100);
    expect(r.totalCost).toBe(650);
    expect(r.netProfit).toBe(350); // 1000 - 650
    expect(r.profitMargin).toBeCloseTo(35, 5);
    expect(r.roi).toBeCloseTo((350 / 650) * 100, 2);
    expect(r.breakEvenCPA).toBeCloseTo(450, 4); // 1000 - (650-100)
    expect(r.breakEvenROAS).toBeCloseTo(1000 / 450, 2);
    expect(r.breakEvenPrice).toBeCloseTo(600 / 0.95, 2); // fixed/(1-0.05)
    expect(r.health).toBe("excellent"); // 35% > 25%
  });

  it("亏损场景返回 danger", () => {
    const r = calculateProfit(base({ price: 300 }));
    expect(r.netProfit).toBeLessThan(0);
    expect(r.health).toBe("danger");
  });

  it("健康区间 10%-25%", () => {
    const r = calculateProfit(base({ price: 800 }));
    expect(r.profitMargin).toBeGreaterThanOrEqual(10);
    expect(r.profitMargin).toBeLessThanOrEqual(25);
    expect(r.health).toBe("healthy");
  });

  it("达人固定费（RMB）正确换算为 THB", () => {
    const r = calculateProfit(
      base({ influencerFixedFeeRMB: 100, rate: 5 }),
    );
    // 100 RMB * 5 = 500 THB，加在达人费用里（佣金为 0）
    expect(r.breakdown.influencerFee).toBe(500);
  });

  it("广告 spend 模式：消耗÷订单", () => {
    const ad = computeAdCost(
      base({ adMode: "spend", adSpend: 1000, adOrders: 10 }),
    );
    expect(ad).toBe(100); // 1000 / 10
  });

  it("团队成本按订单分摊", () => {
    const r = calculateProfit(
      base({ csCost: 1000, opsCost: 1000, teamAmortizeOrders: 100 }),
    );
    // (1000+1000)/100 = 20 THB
    expect(r.breakdown.teamCost).toBe(20);
  });

  it("物流风险损耗 = 售价 × 各率之和", () => {
    const r = calculateProfit(
      base({ returnRate: 5, rejectRate: 2, lostRate: 1, compRate: 1 }),
    );
    expect(r.breakdown.logisticsLoss).toBe(90); // 1000 * 9%
  });

  it("高级成本默认 0 不参与计算（与 DEFAULT_INPUT 一致）", () => {
    const r = calculateProfit(DEFAULT_INPUT);
    expect(r.breakdown.warehouseCost).toBe(0);
    expect(r.breakdown.teamCost).toBe(0);
  });

  it("关闭达人模块：达人费用归 0 且不再计入", () => {
    const on = calculateProfit(
      base({ influencerCommissionRate: 10, influencerFixedFeeRMB: 50, rate: 5 }),
    );
    const off = calculateProfit(
      base({ influencerCommissionRate: 10, influencerFixedFeeRMB: 50, rate: 5, influencerEnabled: false }),
    );
    expect(on.breakdown.influencerFee).toBe(350); // 1000*10% + 50*5
    expect(off.breakdown.influencerFee).toBe(0);
    expect(off.netProfit - on.netProfit).toBe(350);
  });

  it("关闭物流模块：物流损耗归 0", () => {
    const on = calculateProfit(base({ returnRate: 5, rejectRate: 2 }));
    const off = calculateProfit(base({ returnRate: 5, rejectRate: 2, logisticsEnabled: false }));
    expect(on.breakdown.logisticsLoss).toBe(70); // 1000 * 7%
    expect(off.breakdown.logisticsLoss).toBe(0);
  });

  it("关闭广告模块：广告费用归 0", () => {
    const on = calculateProfit(base({ cpa: 100 }));
    const off = calculateProfit(base({ cpa: 100, adEnabled: false }));
    expect(on.breakdown.adCost).toBe(100);
    expect(off.breakdown.adCost).toBe(0);
  });

  it("关闭达人后保本售价随之降低（费率系数已剔除）", () => {
    const on = calculateProfit(base({ influencerCommissionRate: 10 }));
    const off = calculateProfit(base({ influencerCommissionRate: 10, influencerEnabled: false }));
    expect(off.breakEvenPrice).toBeLessThan(on.breakEvenPrice);
  });
});

describe("真实物流：按重量 × 货代单价推导", () => {
  it("weight × rate/kg + handling 推导国际物流", () => {
    const r = calculateProfit(
      base({ purchaseCost: 100, intlShipping: 999, weightGrams: 500, shippingRatePerKg: 20, shippingHandling: 5 }),
    );
    // 0.5kg * 20 + 5 = 15，覆盖手动填写的 999
    expect(r.productCostRMB).toBe(115); // 100 + 15
  });

  it("重量为 0 时保留手动国际物流", () => {
    const r = calculateProfit(base({ purchaseCost: 100, intlShipping: 40, weightGrams: 0 }));
    expect(r.productCostRMB).toBe(140);
  });
});

describe("物流计算模式 logisticsMode", () => {
  it("manual 模式：即使填写重量也尊重显式 intlShipping", () => {
    const r = calculateProfit(
      base({ purchaseCost: 100, intlShipping: 40, weightGrams: 500, shippingRatePerKg: 20, shippingHandling: 5, logisticsMode: "manual" }),
    );
    // 不被推导值 0.5*20+5=15 覆盖，直接用显式 40
    expect(r.productCostRMB).toBe(140);
  });

  it("manual 模式让不同 SKU 各自保留自身国际物流（横向对比/套用正确）", () => {
    const a = calculateProfit(base({ purchaseCost: 100, intlShipping: 10, logisticsMode: "manual" }));
    const b = calculateProfit(base({ purchaseCost: 100, intlShipping: 50, logisticsMode: "manual" }));
    expect(a.productCostRMB).toBe(110);
    expect(b.productCostRMB).toBe(150);
  });
});

describe("VAT 含税切换", () => {
  it("默认（不含税）：VAT 作为成本扣减", () => {
    const r = calculateProfit(base({ price: 1000, vatRate: 7 }));
    expect(r.breakdown.taxCost).toBeCloseTo(70, 4); // 1000 * 7%
  });

  it("售价含税：VAT 为价内税，不重复扣减", () => {
    const r = calculateProfit(base({ price: 1000, vatRate: 7, vatIncluded: true }));
    expect(r.breakdown.taxCost).toBe(0);
  });
});

describe("品类模板", () => {
  it("应用宠物电器模板套用电子类费率与真实物流", () => {
    const input = applyCategory(base({ purchaseCost: 100 }), "pet_electronic");
    expect(input.commissionRate).toBe(6.955);
    expect(input.growthRate).toBe(6.96);
    expect(input.weightGrams).toBe(800);
    expect(input.shippingRatePerKg).toBe(24);
  });
});

describe("amortize 分摊", () => {
  it("订单数为 0 视作已按单件填写", () => {
    expect(amortize(50, 0)).toBe(50);
  });
  it("正常分摊", () => {
    expect(amortize(100, 4)).toBe(25);
  });
});
