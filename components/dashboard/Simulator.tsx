"use client";

import { Slider } from "@/components/ui/slider";
import { useInputStore } from "@/store/useInputStore";
import { useProfit, useEffectiveRate } from "@/hooks/useProfit";
import { calculateProfitAtPrice } from "@/lib/profit-engine";
import { useSettingsStore } from "@/store/useSettingsStore";
import { getCountry } from "@/lib/countries";
import { formatPercent, formatThbWithRmb } from "@/lib/format";

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}

function SliderRow({ label, value, min, max, step, display, onChange }: SliderRowProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-primary">{display}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
        aria-label={label}
      />
    </div>
  );
}

export function Simulator() {
  const data = useInputStore((s) => s.data);
  const setField = useInputStore((s) => s.setField);
  const r = useProfit();
  const rate = useEffectiveRate();
  const country = getCountry(useSettingsStore((s) => s.countryCode));
  const sym = country.currencySymbol;
  const thb = (n: number) => formatThbWithRmb(n, rate, sym);

  const sensitivity = [0.8, 1, 1.2].map((f) => {
    const price = Math.round(data.price * f);
    return { factor: f, price, profit: calculateProfitAtPrice({ ...data, rate }, price) };
  });

  return (
    <div className="space-y-5">
      <SliderRow
        label="售价"
        value={data.price}
        min={1}
        max={2000}
        step={1}
        display={thb(data.price)}
        onChange={(v) => setField("price", v)}
      />
      <SliderRow
        label="CPA"
        value={data.cpa}
        min={0}
        max={500}
        step={1}
        display={thb(data.cpa)}
        onChange={(v) => setField("cpa", v)}
      />
      <SliderRow
        label="达人佣金"
        value={data.influencerCommissionRate}
        min={0}
        max={50}
        step={0.5}
        display={formatPercent(data.influencerCommissionRate)}
        onChange={(v) => setField("influencerCommissionRate", v)}
      />
      <SliderRow
        label="退货率"
        value={data.returnRate}
        min={0}
        max={50}
        step={0.5}
        display={formatPercent(data.returnRate)}
        onChange={(v) => setField("returnRate", v)}
      />
      <SliderRow
        label="拒收率"
        value={data.rejectRate}
        min={0}
        max={30}
        step={0.5}
        display={formatPercent(data.rejectRate)}
        onChange={(v) => setField("rejectRate", v)}
      />

      <div className="space-y-3 rounded-lg bg-muted/50 p-3 text-sm">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">拖动后净利润</span>
            <span className={`font-semibold tabular-nums ${r.netProfit >= 0 ? "text-[hsl(var(--success))]" : "text-[hsl(var(--danger))]"}`}>
              {thb(r.netProfit)}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-muted-foreground">利润率</span>
            <span className="font-medium tabular-nums">{formatPercent(r.profitMargin)}</span>
          </div>
        </div>

        <div className="border-t border-border pt-3">
          <p className="text-muted-foreground">
            广告 CPA 超过{" "}
            <span className="font-semibold text-[hsl(var(--danger))]">
              {thb(r.breakEvenCPA)}
            </span>{" "}
            即转亏（保本红线）
          </p>
        </div>

        <div className="border-t border-border pt-3">
          <p className="mb-1.5 text-muted-foreground">售价敏感性（净利润）</p>
          <div className="space-y-1">
            {sensitivity.map((s) => (
              <div key={s.factor} className="flex items-center justify-between text-xs">
                <span className="tabular-nums">
                  {s.factor === 1 ? "当前" : `${s.factor * 100}%`} · {thb(s.price)}
                </span>
                <span
                  className={`tabular-nums font-medium ${
                    s.profit >= 0 ? "text-[hsl(var(--success))]" : "text-[hsl(var(--danger))]"
                  }`}
                >
                  {thb(s.profit)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
