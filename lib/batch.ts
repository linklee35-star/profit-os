import { calculateProfit } from "./profit-engine";
import type { BatchResult, BatchRow, ProfitInput } from "./types";

// 批量测品：用当前平台的费用设置（平台费 / 税务 / 收款等）作为基准，
// 仅用 Excel 行里的成本与售价覆盖，逐行计算利润并排名。

export function computeBatch(
  rows: BatchRow[],
  base: ProfitInput,
  rate: number,
): BatchResult[] {
  return rows.map((row) => {
    const input: ProfitInput = {
      ...base,
      rate,
      purchaseCost: row.purchaseCost,
      logisticsMode: "manual", // 使用 SKU 自身国际物流，禁用按重量推导（否则所有行会塌成同一值）
      intlShipping: row.logisticsCost, // Excel 的「物流成本」即国际物流
      price: row.price,
      cpa: row.cpa,
      adMode: "cpa",
      influencerCommissionRate: row.influencerCommissionRate,
      // 批测不体现高级成本，保持默认 0
      storageFee: 0,
      localWarehouseHandling: 0,
      packagingLabor: 0,
      orderProcessingFee: 0,
      csCost: 0,
      opsCost: 0,
      softwareCost: 0,
      officeCost: 0,
    };
    const r = calculateProfit(input);
    return {
      ...row,
      productCostTHB: r.productCost,
      netProfit: r.netProfit,
      profitMargin: r.profitMargin,
      roi: r.roi,
    };
  });
}

export type RankKey = "netProfit" | "profitMargin" | "roi";

export function rankBy(rows: BatchResult[], key: RankKey): BatchResult[] {
  return [...rows].sort((a, b) => b[key] - a[key]);
}
