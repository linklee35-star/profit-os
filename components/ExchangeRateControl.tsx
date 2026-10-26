"use client";

import * as React from "react";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { fetchRate, RATE_PROVIDERS } from "@/lib/exchange-rate";
import { getCountry } from "@/lib/countries";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/ui/numeric-input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatRate, formatTime } from "@/lib/format";

// 自动汇率最多 30 分钟刷新一次，避免数据长期停滞在旧时刻
const RATE_MAX_AGE_MS = 30 * 60 * 1000;
const isRateStale = (ts: string | null) =>
  !ts || Date.now() - new Date(ts).getTime() > RATE_MAX_AGE_MS;

export function ExchangeRateControl() {
  const {
    rateSource,
    rateProvider,
    manualRate,
    autoRate,
    autoRateUpdatedAt,
    setRateSource,
    setRateProvider,
    setManualRate,
    setAutoRate,
  } = useSettingsStore();
  const country = getCountry(useSettingsStore((s) => s.countryCode));
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetchRate(rateProvider, country.currency);
      // 用本地刷新时刻作为「更新时间」，用户能直观看到刚刚已更新
      setAutoRate(r.rate, new Date().toISOString());
    } catch (e) {
      setError(e instanceof Error ? e.message : "获取失败");
    } finally {
      setLoading(false);
    }
  }, [rateProvider, country.currency, setAutoRate]);

  // 首次进入：未获取过 或 数据已过期 → 立即拉取
  React.useEffect(() => {
    if (rateSource === "auto" && (autoRate == null || isRateStale(autoRateUpdatedAt))) {
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 后台定时刷新：超过 30 分钟未更新则静默重新拉取（stale-while-revalidate，不阻塞 UI）
  React.useEffect(() => {
    if (rateSource !== "auto") return;
    const id = setInterval(() => {
      if (isRateStale(autoRateUpdatedAt)) refresh();
    }, RATE_MAX_AGE_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rateSource, autoRateUpdatedAt]);

  const effective = rateSource === "custom" ? manualRate : autoRate ?? country.defaultRate;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {rateSource === "auto" && autoRate != null ? (
            <Wifi className="h-4 w-4 text-[hsl(var(--success))]" />
          ) : (
            <WifiOff className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">汇率来源</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">自动</span>
          <Switch
            checked={rateSource === "custom"}
            onCheckedChange={(v) => setRateSource(v ? "custom" : "auto")}
          />
          <span className="text-xs text-muted-foreground">手动</span>
        </div>
      </div>

      {rateSource === "auto" ? (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>API 供应商</Label>
            <Select value={rateProvider} onValueChange={(v) => setRateProvider(v as typeof rateProvider)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RATE_PROVIDERS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
              <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
              {loading ? "获取中" : "刷新"}
            </Button>
            <span className="text-sm tabular-nums">
              1 CNY = <span className="font-semibold">{formatRate(effective)}</span> {country.currency}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            更新时间：{formatTime(autoRateUpdatedAt ?? undefined)}
            {error ? <span className="ml-2 text-[hsl(var(--danger))]">⚠ {error}</span> : null}
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label>手动汇率（1 CNY = ? {country.currency}）</Label>
          <NumericInput
            step={0.0001}
            placeholder="0"
            value={manualRate}
            onValueChange={setManualRate}
            aria-label="手动汇率"
          />
          <p className="text-xs text-muted-foreground">
            启用后覆盖实时汇率，当前生效：{formatRate(effective)} {country.currency}
          </p>
          {autoRate != null ? (() => {
            const dev = ((manualRate - autoRate) / autoRate) * 100;
            if (Math.abs(dev) > 2) {
              return (
                <p className="text-xs text-[hsl(var(--warning))]">
                  ⚠ 手动汇率与自动值偏差 {dev > 0 ? "+" : ""}
                  {dev.toFixed(1)}%，请确认无误（偏差 &gt; 2% 会影响利润核算）
                </p>
              );
            }
            return null;
          })() : null}
        </div>
      )}

      <Separator />
      <p className="text-xs text-muted-foreground">
        自动获取失败时，系统回退至上次成功值或国家默认汇率（{formatRate(country.defaultRate)}），
        计算不中断。
      </p>
    </div>
  );
}
