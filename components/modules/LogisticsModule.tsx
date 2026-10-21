"use client";

import { Truck } from "lucide-react";
import { ModuleCard } from "./ModuleCard";
import { NumberField } from "./NumberField";
import { Switch } from "@/components/ui/switch";
import { useInputStore } from "@/store/useInputStore";

export function LogisticsModule() {
  const enabled = useInputStore((s) => s.data.logisticsEnabled !== false);
  const data = useInputStore((s) => s.data);
  const setField = useInputStore((s) => s.setField);
  const disabled = !enabled;

  const logiPct = enabled
    ? data.returnRate + data.rejectRate + data.lostRate + data.compRate
    : 0;
  const warning =
    enabled && logiPct > 20
      ? `物流损耗占售价 ${logiPct.toFixed(0)}%，偏高，建议优化品控与包装`
      : undefined;

  return (
    <ModuleCard
      title="物流风险"
      description="以售价百分比估算退货 / 拒收 / 丢件 / 赔付损耗"
      icon={<Truck className="h-4 w-4" />}
      disabled={disabled}
      warning={warning}
      right={
        <Switch
          checked={enabled}
          onCheckedChange={(v) => setField("logisticsEnabled", v)}
          aria-label="启用物流风险模块"
        />
      }
    >
      <NumberField field="returnRate" label="退货率" suffix="%" disabled={disabled} />
      <NumberField field="rejectRate" label="拒收率" suffix="%" disabled={disabled} />
      <NumberField field="lostRate" label="丢件率" suffix="%" advanced disabled={disabled} />
      <NumberField field="compRate" label="物流赔付率" suffix="%" advanced disabled={disabled} />
    </ModuleCard>
  );
}
