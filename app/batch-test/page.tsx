"use client";

import * as React from "react";
import { Upload, Download, FileSpreadsheet, Sparkles } from "lucide-react";
import { useInputStore } from "@/store/useInputStore";
import { useEffectiveRate } from "@/hooks/useProfit";
import { useSettingsStore } from "@/store/useSettingsStore";
import { getCountry } from "@/lib/countries";
import { computeBatch, rankBy, type RankKey } from "@/lib/batch";
import { parseBatchExcel, exportBatchExcel, downloadBatchTemplate } from "@/lib/exporters";
import { SAMPLE_BATCH } from "@/lib/sample";
import { formatMoney, formatNumber, formatPercent } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function BatchTestPage() {
  const data = useInputStore((s) => s.data);
  const rate = useEffectiveRate();
  const country = getCountry(useSettingsStore((s) => s.countryCode));
  const sym = country.currencySymbol;

  const [raw, setRaw] = React.useState(SAMPLE_BATCH);
  const [rankKey, setRankKey] = React.useState<RankKey>("netProfit");
  const [busy, setBusy] = React.useState(false);

  const results = React.useMemo(() => computeBatch(raw, data, rate), [raw, data, rate]);
  const ranked = React.useMemo(() => rankBy(results, rankKey), [results, rankKey]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const parsed = await parseBatchExcel(file);
      if (parsed.length) setRaw(parsed);
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  const maxProfit = Math.max(1, ...results.map((r) => r.netProfit));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">批量测品</h1>
          <p className="text-sm text-muted-foreground">
            上传 Excel 批量测算利润 / 利润率 / ROI，自动生成排行榜。当前基准汇率 1 CNY = {formatNumber(rate)} {country.currency}。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={downloadBatchTemplate}>
            <Download className="h-4 w-4" /> 下载模板
          </Button>
          <label className="inline-flex">
            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleUpload} />
            <Button variant="outline" size="sm" asChild>
              <span>
                <Upload className="h-4 w-4" /> {busy ? "解析中" : "上传 Excel"}
              </span>
            </Button>
          </label>
          <Button size="sm" onClick={() => exportBatchExcel(results)}>
            <FileSpreadsheet className="h-4 w-4" /> 导出 Excel
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">排行依据：</span>
        {(["netProfit", "profitMargin", "roi"] as RankKey[]).map((k) => (
          <button
            key={k}
            onClick={() => setRankKey(k)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              rankKey === k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {k === "netProfit" ? "净利润" : k === "profitMargin" ? "利润率" : "ROI"}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>名称</TableHead>
                <TableHead className="text-right">售价</TableHead>
                <TableHead className="text-right">商品成本</TableHead>
                <TableHead className="text-right">净利润</TableHead>
                <TableHead className="text-right">利润率</TableHead>
                <TableHead className="text-right">ROI</TableHead>
                <TableHead className="w-40">可视化</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ranked.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                    <Sparkles className="mx-auto mb-2 h-6 w-6 opacity-50" />
                    暂无数据，点击「上传 Excel」或「载入示例」。
                  </TableCell>
                </TableRow>
              ) : (
                ranked.map((r, i) => (
                  <TableRow key={r.sku + i}>
                    <TableCell className="font-semibold text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-medium">{r.sku}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatMoney(r.price, sym)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatMoney(r.productCostTHB, sym)}</TableCell>
                    <TableCell className={`text-right tabular-nums font-medium ${r.netProfit >= 0 ? "text-[hsl(var(--success))]" : "text-[hsl(var(--danger))]"}`}>
                      {formatMoney(r.netProfit, sym)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatPercent(r.profitMargin)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      <Badge variant={r.roi >= 0 ? "success" : "danger"}>{formatPercent(r.roi)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${(Math.max(0, r.netProfit) / maxProfit) * 100}%` }}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
