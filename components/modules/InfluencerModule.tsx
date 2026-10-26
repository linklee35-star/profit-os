"use client";

import { Users } from "lucide-react";
import { ModuleCard } from "./ModuleCard";
import { NumberField } from "./NumberField";
import { Switch } from "@/components/ui/switch";
import { useInputStore } from "@/store/useInputStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { getCountry } from "@/lib/countries";

export function InfluencerModule() {
  const country = getCountry(useSettingsStore((s) => s.countryCode));
  const enabled = useInputStore((s) => s.data.influencerEnabled !== false);
  const influencerCommissionRate = useInputStore((s) => s.data.influencerCommissionRate);
  const setField = useInputStore((s) => s.setField);
  const disabled = !enabled;

  const infPct = enabled ? influencerCommissionRate : 0;
  const warning =
    enabled && infPct > 30
      ? `达人佣金 ${infPct.toFixed(0)}% 偏高，建议控制在 30% 以内`
      : undefined;

  return (
    <ModuleCard
      title="达人合作"
      description="达人佣金与坑位 / 样品费用（固定费用以人民币计，自动换算）"
      icon={<Users className="h-4 w-4" />}
      disabled={disabled}
      warning={warning}
      right={
        <Switch
          checked={enabled}
          onCheckedChange={(v) => setField("influencerEnabled", v)}
          aria-label="启用达人合作模块"
        />
      }
    >
      <NumberField field="influencerCommissionRate" label="达人佣金" suffix="%" disabled={disabled} />
      <NumberField field="influencerFixedFeeRMB" label="达人坑位费" prefix="¥" advanced disabled={disabled} />
      <NumberField field="influencerSampleFeeRMB" label="达人送样费" prefix="¥" advanced disabled={disabled} />
      <NumberField field="influencerSampleShippingRMB" label="样品物流费" prefix="¥" advanced disabled={disabled} />
      <p className="sm:col-span-2 text-xs text-muted-foreground">
        佣金按售价百分比计算；坑位 / 样品费用计入商品成本（{country.currency}）。
      </p>
    </ModuleCard>
  );
}
