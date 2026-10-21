"use client";

import { useProfit, useEffectiveRate } from "@/hooks/useProfit";
import { useSettingsStore } from "@/store/useSettingsStore";
import { getCountry } from "@/lib/countries";
import { formatThbWithRmb, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * 移动端固定底部结果条：始终显示净利润 + 利润率 + 健康度，
 * 滚动输入表单时不用滑到底部就能看到实时结果。
 */
export function MobileResultBar() {
  const r = useProfit();
  const rate = useEffectiveRate();
  const sym = getCountry(useSettingsStore((s) => s.countryCode)).currencySymbol;

  const scrollToResults = () => {
    const el = document.getElementById("result-panel");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 xl:hidden",
        "border-t border-border bg-card/95 backdrop-blur",
        "pb-[env(safe-area-inset-bottom,0px)]",
      )}
    >
      <button
        type="button"
        onClick={scrollToResults}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left active:bg-accent/50"
      >
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-muted-foreground">净利润</p>
          <p
            className={cn(
              "text-base font-bold tabular-nums",
              r.netProfit >= 0
                ? "text-[hsl(var(--success))]"
                : "text-[hsl(var(--danger))]",
            )}
          >
            {formatThbWithRmb(r.netProfit, rate, sym)}
          </p>
        </div>
        <div className="min-w-[60px] text-center">
          <p className="text-[11px] text-muted-foreground">利润率</p>
          <p className="text-base font-bold tabular-nums">{formatPercent(r.profitMargin)}</p>
        </div>
        <div className="min-w-[56px] text-center">
          <p className="text-[11px] text-muted-foreground">状态</p>
          <p
            className={cn(
              "text-sm font-semibold",
              r.health === "excellent" && "text-[hsl(var(--success))]",
              r.health === "healthy" && "text-[hsl(var(--success))]",
              r.health === "warning" && "text-[hsl(var(--warning))]",
              r.health === "danger" && "text-[hsl(var(--danger))]",
            )}
          >
            {r.health === "excellent" ? "优秀" : r.health === "healthy" ? "健康" : r.health === "warning" ? "偏低" : "亏损"}
          </p>
        </div>
        <svg
          className="ml-2 h-4 w-4 shrink-0 text-muted-foreground"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    </div>
  );
}
