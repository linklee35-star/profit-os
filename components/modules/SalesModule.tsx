"use client";

import { Tag } from "lucide-react";
import { ModuleCard } from "./ModuleCard";
import { NumberField } from "./NumberField";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useInputStore } from "@/store/useInputStore";
import { useProfit, useEffectiveRate } from "@/hooks/useProfit";
import { getCountry } from "@/lib/countries";
import { formatMoney, formatNumber } from "@/lib/format";

export function SalesModule() {
  const country = getCountry(useSettingsStore((s) => s.countryCode));
  const sym = country.currencySymbol;
  const data = useInputStore((s) => s.data);
  const setField = useInputStore((s) => s.setField);
  const price = data.price;
  const rate = useEffectiveRate();
  const rmb = rate > 0 ? price / rate : 0;
  const r = useProfit();

  const hasTarget =
    (data.targetPricingMode === "profit" && data.targetProfit > 0) ||
    (data.targetPricingMode === "margin" && data.targetMargin > 0);

  return (
    <ModuleCard
      title="销售"
      description={`商品在 TikTok Shop 上的售卖价格（${sym}）`}
      icon={<Tag className="h-4 w-4" />}
    >
      <NumberField
        field="price"
        label="商品售价"
        suffix={sym}
        step={1}
        hint={`≈ ¥${formatNumber(rmb)}`}
      />
      {hasTarget && r.suggestedPrice > 0 ? (
        <div className="flex items-center justify-between rounded-lg bg-[hsl(var(--success))]/10 px-3 py-2 text-xs">
          <span className="text-muted-foreground">建议售价</span>
          <button
            type="button"
            onClick={() => setField("price", r.suggestedPrice)}
            className="font-semibold tabular-nums text-[hsl(var(--success))] hover:underline"
            title="点击应用建议售价"
          >
            {formatMoney(r.suggestedPrice, sym)} → 点击应用
          </button>
        </div>
      ) : null}
    </ModuleCard>
  );
}
