"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { useInputStore } from "@/store/useInputStore";
import { useEffectiveRate } from "@/hooks/useProfit";
import { calculateProfit } from "@/lib/profit-engine";
import { useSettingsStore } from "@/store/useSettingsStore";
import { getCountry } from "@/lib/countries";
import { formatMoney, formatNumber } from "@/lib/format";

export default function ProfitCurve() {
  const data = useInputStore((s) => s.data);
  const rate = useEffectiveRate();
  const country = getCountry(useSettingsStore((s) => s.countryCode));
  const sym = country.currencySymbol;

  const points = useMemo(() => {
    const base = data.price || 100;
    const start = Math.max(1, Math.round(base * 0.4));
    const end = Math.round(base * 2.2);
    const stepN = 48;
    const arr: { price: number; profit: number }[] = [];
    for (let i = 0; i <= stepN; i++) {
      const price = start + ((end - start) * i) / stepN;
      const profit = calculateProfit({ ...data, rate, price }).netProfit;
      arr.push({ price: Math.round(price), profit });
    }
    return arr;
  }, [data, rate]);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={points} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="price"
          type="number"
          domain={["dataMin", "dataMax"]}
          tickFormatter={(v) => formatNumber(v, 0)}
          stroke="hsl(var(--muted-foreground))"
          fontSize={11}
        />
        <YAxis
          tickFormatter={(v) => formatNumber(v, 0)}
          stroke="hsl(var(--muted-foreground))"
          fontSize={11}
          width={52}
        />
        <Tooltip
          formatter={(v: number) => formatMoney(v, sym)}
          labelFormatter={(l) => `售价 ${formatMoney(Number(l), sym)}`}
          contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }}
        />
        <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" />
        <ReferenceLine
          x={data.price}
          stroke="hsl(var(--primary))"
          strokeDasharray="4 4"
          label={{ value: "当前", position: "top", fontSize: 10 }}
        />
        <Line type="monotone" dataKey="profit" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
