"use client";

import * as React from "react";
import { Download, Upload, Trash2, Settings2, Globe } from "lucide-react";
import { ExchangeRateControl } from "@/components/ExchangeRateControl";
import { useInputStore } from "@/store/useInputStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useSkuStore } from "@/store/useSkuStore";
import { getCountry } from "@/lib/countries";
import { feeData } from "@/lib/fees";
import { getPlatform } from "@/lib/platforms";
import { downloadText, pickFile, readFileText } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ConfigFile {
  version: 1;
  input: ReturnType<typeof useInputStore.getState>["data"];
  settings: Pick<
    ReturnType<typeof useSettingsStore.getState>,
    "mode" | "countryCode" | "rateSource" | "rateProvider" | "manualRate"
  >;
  sku: ReturnType<typeof useSkuStore.getState>["items"];
}

export default function SettingsPage() {
  const countryCode = useSettingsStore((s) => s.countryCode);
  const platformId = useSettingsStore((s) => s.platformId);
  const country = getCountry(countryCode);

  const exportConfig = () => {
    const cfg: ConfigFile = {
      version: 1,
      input: useInputStore.getState().data,
      settings: {
        mode: useSettingsStore.getState().mode,
        countryCode: useSettingsStore.getState().countryCode,
        rateSource: useSettingsStore.getState().rateSource,
        rateProvider: useSettingsStore.getState().rateProvider,
        manualRate: useSettingsStore.getState().manualRate,
      },
      sku: useSkuStore.getState().items,
    };
    downloadText("profit-os-config.json", JSON.stringify(cfg, null, 2));
  };

  const importConfig = async () => {
    const file = await pickFile(".json");
    if (!file) return;
    try {
      const text = await readFileText(file);
      const cfg = JSON.parse(text) as ConfigFile;
      if (cfg.input) useInputStore.getState().setData(cfg.input);
      if (cfg.settings) {
        const s = useSettingsStore.getState();
        s.setMode(cfg.settings.mode);
        s.setCountry(cfg.settings.countryCode);
        s.setRateSource(cfg.settings.rateSource);
        s.setRateProvider(cfg.settings.rateProvider);
        s.setManualRate(cfg.settings.manualRate);
      }
      if (cfg.sku) useSkuStore.setState({ items: cfg.sku });
      alert("配置已导入");
    } catch {
      alert("配置文件无效");
    }
  };

  const resetAll = () => {
    if (!confirm("确认清空全部数据（输入 / 设置 / SKU）？此操作不可撤销。")) return;
    useInputStore.getState().reset(countryCode, platformId);
    useSkuStore.getState().clear();
    useSettingsStore.getState().setMode("quick");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">设置</h1>
        <p className="text-sm text-muted-foreground">汇率、销售站点与数据管理。</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4" /> 汇率
          </CardTitle>
          <CardDescription>CNY → {country.currency}（{country.flag} {country.name}）</CardDescription>
        </CardHeader>
        <CardContent>
          <ExchangeRateControl />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings2 className="h-4 w-4" /> 支持的销售站点
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {feeData.map((fee) => {
              const marketCountry = getCountry(fee.country);
              const platform = getPlatform(fee.platform);
              const active = fee.country === countryCode && fee.platform === platformId;
              return (
                <div
                  key={`${fee.platform}:${fee.country}`}
                  className={`rounded-lg border px-3 py-2 text-sm ${active ? "border-primary bg-accent" : "border-border"}`}
                >
                  <p className="font-medium">{platform.name} · {marketCountry.name}站</p>
                  <p className="text-xs text-muted-foreground">
                    {marketCountry.currency} · {marketCountry.taxName ?? "VAT"} {marketCountry.vat}%
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">数据管理</CardTitle>
          <CardDescription>所有数据保存在本地浏览器（LocalStorage），自动保存。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={exportConfig}>
              <Download className="h-4 w-4" /> 导出配置
            </Button>
            <Button variant="outline" size="sm" onClick={importConfig}>
              <Upload className="h-4 w-4" /> 导入配置
            </Button>
            <Button variant="destructive" size="sm" onClick={resetAll}>
              <Trash2 className="h-4 w-4" /> 清空数据
            </Button>
          </div>
          <Separator />
          <p className="text-xs text-muted-foreground">
            导出为 JSON 文件，可在其它设备导入恢复；也可纳入版本管理作为团队默认配置。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
