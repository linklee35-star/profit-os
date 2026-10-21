"use client";

import * as React from "react";
import { useProfit, useEffectiveRate } from "@/hooks/useProfit";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useInputStore } from "@/store/useInputStore";
import { getCountry } from "@/lib/countries";
import { formatNumber, formatPercent, formatThbWithRmb } from "@/lib/format";
import { MetricCard } from "./MetricCard";

export function MetricGrid() {
  const r = useProfit();
  const data = useInputStore((s) => s.data);
  const country = getCountry(useSettingsStore((s) => s.countryCode));
  const sym = country.currencySymbol;
  const rate = useEffectiveRate();
  const thb = (n: number) => formatThbWithRmb(n, rate, sym);

  const hasTarget =
    (data.targetPricingMode === "profit" && data.targetProfit > 0) ||
    (data.targetPricingMode === "margin" && data.targetMargin > 0);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <MetricCard
        label="单件净利润"
        value={r.netProfit}
        format={thb}
        emphasize
        tone={r.netProfit >= 0 ? "success" : "danger"}
        hint="售价 − 全部成本"
      />
      <MetricCard
        label="利润率"
        value={r.profitMargin}
        format={(n) => formatPercent(n)}
        emphasize
        tone={r.health === "danger" ? "danger" : r.health === "warning" ? "warning" : "success"}
        hint="净利润 ÷ 售价"
      />
      <MetricCard
        label="ROI"
        value={r.roi}
        format={(n) => formatPercent(n)}
        emphasize
        tone="primary"
        hint="净利润 ÷ 总成本"
      />

      {hasTarget && r.suggestedPrice > 0 ? (
        <MetricCard
          label="建议售价"
          value={r.suggestedPrice}
          format={thb}
          emphasize
          tone="success"
          hint={data.targetPricingMode === "profit" ? `目标净利 ${formatThbWithRmb(data.targetProfit, rate, sym)}` : `目标利润率 ${formatPercent(data.targetMargin, 0)}`}
        />
      ) : (
        <MetricCard label="保本售价" value={r.breakEvenPrice} format={thb} hint="覆盖全部成本的最低售价" />
      )}

      <MetricCard label="保本 CPA" value={r.breakEvenCPA} format={thb} hint="广告可承受上限" />
      <MetricCard label="保本 ROAS" value={r.breakEvenROAS} format={(n) => `${formatNumber(n)}x`} hint="售价 ÷ 保本CPA" />

      <MetricCard label="总成本" value={r.totalCost} format={thb} emphasize />
    </div>
  );
}
