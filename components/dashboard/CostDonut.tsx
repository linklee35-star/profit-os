"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useProfit } from "@/hooks/useProfit";
import { useSettingsStore } from "@/store/useSettingsStore";
import { getCountry } from "@/lib/countries";
import { formatMoney } from "@/lib/format";

const COLORS = [
  "#5c8272",
  "#738791",
  "#b3915d",
  "#a97880",
  "#82a085",
  "#aa6755",
  "#8c819b",
  "#77a8a3",
  "#87908b",
];

export default function CostDonut() {
  const r = useProfit();
  const country = getCountry(useSettingsStore((s) => s.countryCode));
  const sym = country.currencySymbol;

  const data = [
    { name: "商品成本", value: r.breakdown.productCost },
    { name: "平台费用", value: r.breakdown.platformFee },
    { name: "广告费用", value: r.breakdown.adCost },
    { name: "达人费用", value: r.breakdown.influencerFee },
    { name: "税务成本", value: r.breakdown.taxCost },
    { name: "物流损耗", value: r.breakdown.logisticsLoss },
    { name: "收款成本", value: r.breakdown.receivingCost },
    { name: "仓储成本", value: r.breakdown.warehouseCost },
    { name: "团队成本", value: r.breakdown.teamCost },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return <p className="py-12 text-center text-sm text-muted-foreground">暂无成本数据</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          strokeWidth={2}
          stroke="hsl(var(--card))"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v: number, n: string) => [formatMoney(v, sym), n]}
          contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
}
