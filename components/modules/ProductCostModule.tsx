"use client";

import { Package } from "lucide-react";
import { ModuleCard } from "./ModuleCard";
import { NumberField } from "./NumberField";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useProfit } from "@/hooks/useProfit";
import { useInputStore } from "@/store/useInputStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { getCountry } from "@/lib/countries";
import { formatMoney, formatNumber } from "@/lib/format";

export function ProductCostModule() {
  const { productCostRMB, productCost } = useProfit();
  const data = useInputStore((s) => s.data);
  const setField = useInputStore((s) => s.setField);
  const country = getCountry(useSettingsStore((s) => s.countryCode));

  const isWeightMode = data.logisticsMode === "weight";
  // 与引擎一致：按重量推导 or 使用手动国际物流
  const intl =
    isWeightMode && data.weightGrams > 0
      ? (data.weightGrams / 1000) * data.shippingRatePerKg + data.shippingHandling
      : data.intlShipping;
  const baseCost = data.purchaseCost + data.domesticShipping + data.packagingCost || 1;
  const shipRatio = intl / (baseCost + intl);
  const warning =
    shipRatio > 0.4
      ? `国际物流占商品成本 ${(shipRatio * 100).toFixed(0)}%，偏高，建议优化包裹重量或换更优货代`
      : undefined;

  return (
    <ModuleCard
      title="商品成本"
      description="采购与国内段费用（人民币），自动换算为目标币种"
      icon={<Package className="h-4 w-4" />}
      warning={warning}
    >
      <NumberField field="purchaseCost" label="采购成本" prefix="¥" />
      <NumberField field="domesticShipping" label="国内运费" prefix="¥" />
      <NumberField field="packagingCost" label="包装成本" prefix="¥" />
      <NumberField field="otherCost" label="其它成本" prefix="¥" advanced />

      {/* 物流计算模式切换 */}
      <div className="sm:col-span-2 flex items-center justify-between rounded-lg border border-dashed p-3">
        <div className="space-y-0.5">
          <Label htmlFor="logisticsMode" className="text-sm font-medium">
            按重量计算国际物流
          </Label>
          <p className="text-xs text-muted-foreground">
            开启：重量 × 货代单价自动推导；关闭：手动填写国际物流（如从 SKU 库套用）
          </p>
        </div>
        <Switch
          id="logisticsMode"
          checked={isWeightMode}
          onCheckedChange={(v) => setField("logisticsMode", v ? "weight" : "manual")}
          aria-label="按重量计算国际物流"
        />
      </div>

      {isWeightMode ? (
        <>
          <NumberField field="weightGrams" label="商品重量" suffix="g" step={10} min={0} hint="用于按重量计算国际物流" />
          <NumberField field="shippingRatePerKg" label="物流单价" prefix="¥" suffix="/kg" step={0.5} min={0} hint="货代报价，如空运专线 ¥22/kg" />
          <NumberField field="shippingHandling" label="物流固定费" prefix="¥" step={0.5} min={0} />
        </>
      ) : (
        <NumberField
          field="intlShipping"
          label="国际物流（手动）"
          prefix="¥"
          step={0.5}
          min={0}
          hint="手动填写实际国际物流成本（RMB）"
        />
      )}

      <div className="rounded-lg bg-primary/5 p-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">国际物流{isWeightMode ? "（推导）" : "（手动）"}</span>
          <span className="font-semibold tabular-nums">¥{formatNumber(intl)}</span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {isWeightMode && data.weightGrams > 0
            ? `${data.weightGrams}g × ¥${formatNumber(data.shippingRatePerKg)}/kg + ¥${formatNumber(data.shippingHandling)}`
            : isWeightMode
              ? "未填重量，使用手动国际物流"
              : "手动模式：使用填写的国际物流"}
        </p>
      </div>

      <div className="sm:col-span-2 rounded-lg bg-muted/50 p-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">商品总成本（RMB）</span>
          <span className="font-medium tabular-nums">¥{formatNumber(productCostRMB)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-muted-foreground">商品总成本（{country.currency}）</span>
          <span className="font-semibold tabular-nums text-primary">
            {formatMoney(productCost, country.currencySymbol)}
          </span>
        </div>
      </div>
    </ModuleCard>
  );
}
