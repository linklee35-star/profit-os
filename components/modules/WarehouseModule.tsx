"use client";

import { Warehouse } from "lucide-react";
import { ModuleCard } from "./ModuleCard";
import { NumberField } from "./NumberField";
import { useSettingsStore } from "@/store/useSettingsStore";
import { getCountry } from "@/lib/countries";

export function WarehouseModule() {
  const country = getCountry(useSettingsStore((s) => s.countryCode));
  return (
    <ModuleCard
      title="仓储"
      description="本土仓相关固定费用（真实利润模式）"
      icon={<Warehouse className="h-4 w-4" />}
      advanced
    >
      <NumberField field="storageFee" label="仓储费" suffix={country.currencySymbol} />
      <NumberField field="localWarehouseHandling" label="本土仓操作费" suffix={country.currencySymbol} />
      <NumberField field="packagingLabor" label="包装人工费" suffix={country.currencySymbol} />
      <NumberField field="orderProcessingFee" label="订单处理费" suffix={country.currencySymbol} />
    </ModuleCard>
  );
}
