"use client";

import { Landmark } from "lucide-react";
import { ModuleCard } from "./ModuleCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/ui/numeric-input";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useInputStore } from "@/store/useInputStore";
import { getCountry } from "@/lib/countries";
import { getPlatform } from "@/lib/platforms";
import { getPlatformFees } from "@/lib/fees";
import { applyCountryDefaults } from "@/lib/schema";

/**
 * 平台费用模块 —— schema 驱动
 * 费目结构来自当前平台（PlatformFeeSchema.feeFields），不再写死 TikTok 四项；
 * 用户改动费目 → 同步写入 platformFeeValues（原始值）+ 经 mapToInput 写入引擎四槽位
 */
export function PlatformFeeModule() {
  const countryCode = useSettingsStore((s) => s.countryCode);
  const platformId = useSettingsStore((s) => s.platformId);
  const mode = useSettingsStore((s) => s.mode);
  const country = getCountry(countryCode);
  const platform = getPlatform(platformId);
  const fees = getPlatformFees(platformId, countryCode);
  const setData = useInputStore((s) => s.setData);
  const cur = useInputStore((s) => s.data);
  const values = cur.platformFeeValues ?? {};

  const onChange = (key: string, v: number) => {
    const next = { ...values, [key]: v };
    const mapped = platform.mapToInput ? platform.mapToInput(next) : {};
    setData({ ...cur, ...mapped, platformFeeValues: next });
  };

  const visibleFields = platform.feeFields.filter((f) => !(f.advanced && mode === "quick"));

  return (
    <ModuleCard
      title={`平台费用 · ${platform.name}`}
      description={
        fees
          ? `费率数据：${fees.effectiveFrom} 生效（${fees.source}）`
          : "该国暂无该平台费率数据，使用内置默认值"
      }
      icon={<Landmark className="h-4 w-4" />}
    >
      {visibleFields.map((f) => (
        <div key={f.key} className="space-y-1.5">
          <Label htmlFor={`fee-${f.key}`}>
            {f.labelZh}
            {f.note ? (
              <span className="ml-1 text-xs font-normal text-muted-foreground">· {f.note}</span>
            ) : null}
          </Label>
          <div className="relative">
            <NumericInput
              id={`fee-${f.key}`}
              className="pr-9"
              placeholder=""
              value={values[f.key] ?? 0}
              onValueChange={(n) => onChange(f.key, n)}
              aria-label={f.labelZh}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {f.unit === "percent" ? "%" : country.currencySymbol}
            </span>
          </div>
        </div>
      ))}
      <div className="sm:col-span-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setData(applyCountryDefaults(cur, country, platformId))}
        >
          恢复{country.name}·{platform.name}默认费率
        </Button>
        <span className="ml-2 text-xs text-muted-foreground">修改已自动保存</span>
      </div>
    </ModuleCard>
  );
}
