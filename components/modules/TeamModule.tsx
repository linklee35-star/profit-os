"use client";

import { Users2 } from "lucide-react";
import { ModuleCard } from "./ModuleCard";
import { NumberField } from "./NumberField";
import { useSettingsStore } from "@/store/useSettingsStore";
import { getCountry } from "@/lib/countries";

export function TeamModule() {
  const country = getCountry(useSettingsStore((s) => s.countryCode));
  return (
    <ModuleCard
      title="团队成本"
      description="按订单数自动分摊到单件（真实利润模式）"
      icon={<Users2 className="h-4 w-4" />}
      advanced
    >
      <NumberField field="csCost" label="客服成本" suffix={country.currencySymbol} />
      <NumberField field="opsCost" label="运营成本" suffix={country.currencySymbol} />
      <NumberField field="softwareCost" label="软件订阅" suffix={country.currencySymbol} />
      <NumberField field="officeCost" label="办公成本" suffix={country.currencySymbol} />
      <NumberField field="teamAmortizeOrders" label="分摊订单数" step={1} min={1} />
    </ModuleCard>
  );
}
