"use client";

import { Card } from "@/components/ui/card";
import { useProfit, useEffectiveRate } from "@/hooks/useProfit";
import { getCountry } from "@/lib/countries";
import { formatMoney, formatNumber, formatPercent } from "@/lib/format";
import { useSettingsStore } from "@/store/useSettingsStore";
import { HealthBanner } from "./HealthBanner";
import { MetricCard } from "./MetricCard";

export function MetricGrid() {
  const result = useProfit();
  const country = getCountry(useSettingsStore((state) => state.countryCode));
  const rate = useEffectiveRate();
  const money = (n: number) => formatMoney(n, country.currencySymbol);
  const cny = (n: number) => `≈ ${formatMoney(rate > 0 ? n / rate : 0, "¥")}`;
  const hasSuggestion = result.suggestedPrice > 0;
  const canCoverAds = result.breakEvenCPA > 0;

  return (
    <Card className="overflow-hidden border-primary/20">
      <dl className="grid grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] bg-accent/60">
        <MetricCard label="单件净利润" value={result.netProfit} format={money} secondary={cny} emphasize tone={result.netProfit >= 0 ? "success" : "danger"} className="row-span-2 self-center px-4 py-5 sm:px-5" />
        <MetricCard label="利润率" value={result.profitMargin} format={formatPercent} className="border-l border-border" />
        <MetricCard label="ROI" value={result.roi} format={formatPercent} className="border-l border-t border-border" />
      </dl>
      <dl className="grid grid-cols-2 gap-px border-t border-border bg-border [&>div]:bg-card">
        <MetricCard label={hasSuggestion ? "建议售价" : "保本售价"} value={hasSuggestion ? result.suggestedPrice : result.breakEvenPrice} format={money} secondary={cny} tone={hasSuggestion ? "primary" : "default"} />
        <MetricCard label="总成本" value={result.totalCost} format={money} secondary={cny} />
        <MetricCard label="保本 CPA" value={result.breakEvenCPA} format={result.breakEvenCPA < 0 ? () => "无法保本" : money} secondary={result.breakEvenCPA >= 0 ? cny : undefined} hint={result.breakEvenCPA < 0 ? "当前售价下，广告费为零仍亏损" : undefined} />
        <MetricCard label="保本 ROAS" value={result.breakEvenROAS} format={canCoverAds ? (n) => `${formatNumber(n)}×` : () => "—"} />
      </dl>
      <HealthBanner health={result.health} />
    </Card>
  );
}
