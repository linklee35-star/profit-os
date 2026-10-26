"use client";

import { useMemo } from "react";
import { useInputStore } from "@/store/useInputStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { getCountry } from "@/lib/countries";
import { calculateProfit, calculateProfitAtPrice } from "@/lib/profit-engine";

/** 当前生效汇率：自定义优先，否则取自动汇率，再回退国家默认 */
export function useEffectiveRate(): number {
  const rateSource = useSettingsStore((s) => s.rateSource);
  const manualRate = useSettingsStore((s) => s.manualRate);
  const autoRate = useSettingsStore((s) => s.autoRate);
  const countryCode = useSettingsStore((s) => s.countryCode);
  const country = getCountry(countryCode);
  if (rateSource === "custom") return manualRate;
  return autoRate ?? country.defaultRate;
}

/** 实时利润结果（输入/汇率变化自动重算） */
export function useProfit() {
  const data = useInputStore((s) => s.data);
  const rate = useEffectiveRate();
  return useMemo(() => calculateProfit({ ...data, rate }), [data, rate]);
}

/** 在指定售价下的净利润（利润模拟曲线用） */
export function useProfitAtPrice(price: number) {
  const data = useInputStore((s) => s.data);
  const rate = useEffectiveRate();
  return useMemo(
    () => calculateProfitAtPrice({ ...data, rate }, price),
    [data, rate, price],
  );
}
