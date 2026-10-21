"use client";

import { Landmark } from "lucide-react";
import { ModuleCard } from "./ModuleCard";
import { NumberField } from "./NumberField";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useInputStore } from "@/store/useInputStore";
import { getCountry } from "@/lib/countries";
import { applyCountryDefaults } from "@/lib/schema";

export function PlatformFeeModule() {
  const country = getCountry(useSettingsStore((s) => s.countryCode));
  const setData = useInputStore((s) => s.setData);
  const cur = useInputStore((s) => s.data);

  return (
    <ModuleCard
      title="平台费用"
      description="TikTok Shop 平台抽成（可在设置中切换国家后重置）"
      icon={<Landmark className="h-4 w-4" />}
    >
      <NumberField field="commissionRate" label="佣金" suffix="%" />
      <NumberField field="transactionRate" label="交易费" suffix="%" />
      <NumberField field="growthRate" label="增长费" suffix="%" advanced />
      <NumberField field="infrastructureFee" label="基础设施费" suffix={country.currencySymbol} advanced />
      <div className="sm:col-span-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setData(applyCountryDefaults(cur, country))}
        >
          恢复{country.name}默认值
        </Button>
        <span className="ml-2 text-xs text-muted-foreground">修改已自动保存</span>
      </div>
    </ModuleCard>
  );
}
