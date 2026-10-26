"use client";

import { useInputStore } from "@/store/useInputStore";
import { useProfit, useEffectiveRate } from "@/hooks/useProfit";
import { useSettingsStore } from "@/store/useSettingsStore";
import { getCountry } from "@/lib/countries";
import { ModuleCard } from "./ModuleCard";
import { NumberField } from "./NumberField";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatMoney, formatPercent } from "@/lib/format";
import type { TargetPricingMode } from "@/lib/types";
import { Target } from "lucide-react";

export function TargetPriceModule() {
  const data = useInputStore((s) => s.data);
  const setField = useInputStore((s) => s.setField);
  const r = useProfit();
  const rate = useEffectiveRate();
  const country = getCountry(useSettingsStore((s) => s.countryCode));
  const sym = country.currencySymbol;

  const hasTarget =
    (data.targetPricingMode === "profit" && data.targetProfit > 0) ||
    (data.targetPricingMode === "margin" && data.targetMargin > 0);

  return (
    <ModuleCard
      title="目标定价"
      description="输入预期利润 / 利润率，自动反推建议售价"
      icon={<Target className="h-4 w-4" />}
      advanced
    >
      <div className="space-y-1.5">
        <Label className="text-sm">定价模式</Label>
        <Select
          value={data.targetPricingMode}
          onValueChange={(v) => setField("targetPricingMode", v as TargetPricingMode)}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="profit">按目标净利润</SelectItem>
            <SelectItem value="margin">按目标利润率</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {data.targetPricingMode === "profit" ? (
        <NumberField
          field="targetProfit"
          label="目标净利润"
          suffix={sym}
          hint="期望每单净赚多少"
        />
      ) : (
        <NumberField
          field="targetMargin"
          label="目标利润率"
          suffix="%"
          hint="期望利润率（如 20）"
        />
      )}

      {hasTarget && r.suggestedPrice > 0 ? (
        <div className="rounded-lg border border-[hsl(var(--success))]/40 bg-[hsl(var(--success))]/10 p-3 text-center">
          <p className="text-[11px] text-muted-foreground">
            {data.targetPricingMode === "profit"
              ? `要达到净利润 ${formatMoney(data.targetProfit, sym)}`
              : `要达到利润率 ${formatPercent(data.targetMargin, 0)}`}
          </p>
          <p className="mt-0.5 text-lg font-bold tabular-nums text-[hsl(var(--success))]">
            建议售价 {formatMoney(r.suggestedPrice, sym)}
          </p>
          <p className="text-[11px] text-muted-foreground">
            ≈ ¥{formatMoney(r.suggestedPrice / rate, "¥")}
          </p>
        </div>
      ) : null}

      {data.targetPricingMode === "profit" && data.targetProfit > 0 && r.suggestedPrice === 0 ? (
        <p className="text-xs text-[hsl(var(--danger))]">
          总费率超100%，目标利润在当前成本结构下不可达
        </p>
      ) : null}
    </ModuleCard>
  );
}
