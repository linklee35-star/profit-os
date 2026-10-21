"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfit, useEffectiveRate } from "@/hooks/useProfit";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useInputStore } from "@/store/useInputStore";
import { getCountry } from "@/lib/countries";
import { formatPercent, formatThbWithRmb } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CostBreakdown } from "@/lib/types";

type BreakdownKey = keyof CostBreakdown;

const ITEMS: { key: BreakdownKey; label: string; color: string }[] = [
  { key: "productCost", label: "商品成本", color: "#6366f1" },
  { key: "platformFee", label: "平台费用", color: "#0ea5e9" },
  { key: "adCost", label: "广告费用", color: "#f59e0b" },
  { key: "influencerFee", label: "达人费用", color: "#ec4899" },
  { key: "taxCost", label: "税务成本", color: "#10b981" },
  { key: "importDutyCost", label: "进口关税(买家付)", color: "#f97316" },
  { key: "logisticsLoss", label: "物流损耗", color: "#ef4444" },
  { key: "receivingCost", label: "收款成本", color: "#8b5cf6" },
  { key: "warehouseCost", label: "仓储成本", color: "#14b8a6" },
  { key: "teamCost", label: "团队成本", color: "#64748b" },
];

/**
 * 成本结构明细：按金额降序，每项显示金额（泰铢 + 换算人民币）+ 占「总成本」比例（进度条 + 百分比）。
 * 顶部概览售价 / 总成本 / 净利润，让「成本吃掉了多少利润」一目了然。
 * 被关闭的模块（广告 / 达人 / 物流）以灰显 + 「已停用」标记呈现，不再计入。
 */
export function CostBreakdownList() {
  const r = useProfit();
  const rate = useEffectiveRate();
  const sym = getCountry(useSettingsStore((s) => s.countryCode)).currencySymbol;
  const data = useInputStore((s) => s.data);

  const thb = (n: number) => formatThbWithRmb(n, rate, sym);

  const disabledMap: Partial<Record<BreakdownKey, boolean>> = {
    adCost: data.adEnabled === false,
    influencerFee: data.influencerEnabled === false,
    logisticsLoss: data.logisticsEnabled === false,
  };

  const withValues = ITEMS.map((it) => ({
    ...it,
    value: r.breakdown[it.key],
    disabled: !!disabledMap[it.key],
  }));

  const active = withValues
    .filter((it) => !it.disabled && it.value > 0)
    .sort((a, b) => b.value - a.value);
  const disabledItems = withValues.filter((it) => it.disabled);
  const items = [...active, ...disabledItems];

  const max = active.length ? active[0].value : 0;
  const base = r.totalCost > 0 ? r.totalCost : 1;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">成本结构明细</CardTitle>
        <p className="text-xs text-muted-foreground">按金额排序 · 占比 = 该成本 ÷ 总成本 · 括号内为换算人民币</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 概览：售价 / 总成本 / 净利润 / 买家总额 */}
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/50 p-3 text-center sm:grid-cols-4">
          <div>
            <p className="text-[11px] text-muted-foreground">售价</p>
            <p className="text-sm font-semibold tabular-nums">{thb(r.price)}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">总成本</p>
            <p className="text-sm font-semibold tabular-nums">{thb(r.totalCost)}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">净利润</p>
            <p
              className={cn(
                "text-sm font-semibold tabular-nums",
                r.netProfit >= 0 ? "text-[hsl(var(--success))]" : "text-[hsl(var(--danger))]",
              )}
            >
              {thb(r.netProfit)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">{data.dutyEnabled ? "买家应付" : "买家应付"}</p>
            <p className="text-sm font-semibold tabular-nums text-[hsl(var(--warning))]">
              {thb(r.buyerTotalCost)}
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            暂无成本数据，请在左侧填写成本项
          </p>
        ) : (
          <ul className="space-y-2.5">
            {items.map((it, idx) => {
              const pct = (it.value / base) * 100;
              const w = max ? (it.value / max) * 100 : 0;
              return (
                <li key={it.key} className={cn(it.disabled && "opacity-50")}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: it.color }}
                      />
                      {it.label}
                      {!it.disabled && idx === 0 ? (
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                          最高
                        </span>
                      ) : null}
                      {it.disabled ? (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          已停用
                        </span>
                      ) : null}
                    </span>
                    <span className="tabular-nums font-medium">{thb(it.value)}</span>
                  </div>
                  {!it.disabled ? (
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-[width] duration-300"
                          style={{ width: `${w}%`, background: it.color }}
                        />
                      </div>
                      <span className="w-12 text-right text-xs tabular-nums text-muted-foreground">
                        {formatPercent(pct)}
                      </span>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
