"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useProfit } from "@/hooks/useProfit";
import { useSettingsStore } from "@/store/useSettingsStore";
import { getCountry } from "@/lib/countries";
import { formatMoney } from "@/lib/format";

const COLOR: Record<string, string> = {
  商品成本: "#5c8272",
  平台费用: "#738791",
  广告费用: "#b3915d",
  达人费用: "#a97880",
  税务成本: "#82a085",
  物流损耗: "#aa6755",
  收款成本: "#8c819b",
  仓储成本: "#77a8a3",
  团队成本: "#87908b",
};

const ORDER = [
  "商品成本",
  "平台费用",
  "广告费用",
  "达人费用",
  "税务成本",
  "物流损耗",
  "收款成本",
  "仓储成本",
  "团队成本",
];

export default function PriceBreakdown() {
  const r = useProfit();
  const country = getCountry(useSettingsStore((s) => s.countryCode));
  const sym = country.currencySymbol;
  const b = r.breakdown;

  const row: Record<string, string | number> = { name: "售价" };
  ORDER.forEach((k) => {
    row[k] = b[k as keyof typeof b] as number;
  });
  row["净利润"] = Math.max(0, r.netProfit);
  const data = [row];

  return (
    <div className="space-y-2">
      <ResponsiveContainer width="100%" height={64}>
        <BarChart layout="vertical" data={data} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" hide />
          <Tooltip
            formatter={(v: number, n: string) => [formatMoney(v, sym), n]}
            cursor={false}
            contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }}
          />
          {ORDER.map((k) => (
            <Bar key={k} dataKey={k} stackId="a" fill={COLOR[k]} />
          ))}
          <Bar dataKey="净利润" stackId="a">
            <Cell fill={r.netProfit >= 0 ? "hsl(var(--success))" : "hsl(var(--danger))"} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        {ORDER.map((k) => (
          <span key={k} className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ background: COLOR[k] }} />
            {k}
          </span>
        ))}
        <span className="inline-flex items-center gap-1">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: r.netProfit >= 0 ? "hsl(var(--success))" : "hsl(var(--danger))" }}
          />
          净利润
        </span>
      </div>
    </div>
  );
}
