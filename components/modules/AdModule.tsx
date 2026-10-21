"use client";

import { Megaphone } from "lucide-react";
import { ModuleCard } from "./ModuleCard";
import { NumberField } from "./NumberField";
import { Switch } from "@/components/ui/switch";
import { useInputStore } from "@/store/useInputStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { getCountry } from "@/lib/countries";
import { computeAdCost } from "@/lib/fee-engine";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AdModule() {
  const data = useInputStore((s) => s.data);
  const setField = useInputStore((s) => s.setField);
  const country = getCountry(useSettingsStore((s) => s.countryCode));
  const enabled = data.adEnabled !== false;
  const disabled = !enabled;

  const adCost = computeAdCost(data);
  const adPct = data.price > 0 ? (adCost / data.price) * 100 : 0;
  const warning =
    enabled && adPct > 30
      ? `广告占售价 ${adPct.toFixed(0)}%，偏高，建议控制在 30% 以内`
      : undefined;

  return (
    <ModuleCard
      title="广告"
      description="支持直接填 CPA，或按「消耗 ÷ 订单」自动计算"
      icon={<Megaphone className="h-4 w-4" />}
      disabled={disabled}
      warning={warning}
      right={
        <Switch
          checked={enabled}
          onCheckedChange={(v) => setField("adEnabled", v)}
          aria-label="启用广告模块"
        />
      }
    >
      <div className="space-y-1.5">
        <span className="text-sm font-medium">计费模式</span>
        <Select
          value={data.adMode}
          disabled={disabled}
          onValueChange={(v) => setField("adMode", v as "cpa" | "spend")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cpa">直接输入 CPA</SelectItem>
            <SelectItem value="spend">消耗 ÷ 订单</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {data.adMode === "cpa" ? (
        <NumberField field="cpa" label="CPA（单均获客成本）" suffix={country.currencySymbol} disabled={disabled} />
      ) : (
        <>
          <NumberField field="adSpend" label="广告总消耗" suffix={country.currencySymbol} disabled={disabled} />
          <NumberField field="adOrders" label="订单数" step={1} min={0} disabled={disabled} />
        </>
      )}

      <NumberField field="adCreativeCost" label="广告素材成本" suffix={country.currencySymbol} advanced disabled={disabled} />
      <NumberField field="adAgencyFee" label="代理服务费" suffix={country.currencySymbol} advanced disabled={disabled} />
      <NumberField field="adProductionCost" label="创意制作成本" suffix={country.currencySymbol} advanced disabled={disabled} />
      <NumberField field="adAmortizeOrders" label="高级成本分摊订单数" step={1} min={1} advanced disabled={disabled} />
    </ModuleCard>
  );
}
