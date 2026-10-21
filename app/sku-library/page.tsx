"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Copy, Pencil, Trash2, Wand2, Boxes, Save } from "lucide-react";
import { useSkuStore } from "@/store/useSkuStore";
import { useInputStore } from "@/store/useInputStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useEffectiveRate } from "@/hooks/useProfit";
import { getCountry } from "@/lib/countries";
import { computeBatch, rankBy, type RankKey } from "@/lib/batch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SkuFormDialog, type SkuFormValues } from "@/components/sku/SkuFormDialog";
import { formatMoney, formatNumber, formatPercent } from "@/lib/format";

export default function SkuLibraryPage() {
  const router = useRouter();
  const items = useSkuStore((s) => s.items);
  const add = useSkuStore((s) => s.add);
  const update = useSkuStore((s) => s.update);
  const remove = useSkuStore((s) => s.remove);
  const duplicate = useSkuStore((s) => s.duplicate);
  const loadSamples = useSkuStore((s) => s.loadSamples);
  const setField = useInputStore((s) => s.setField);
  const data = useInputStore((s) => s.data);
  const rate = useEffectiveRate();
  const countryCode = useSettingsStore((s) => s.countryCode);
  const country = getCountry(countryCode);
  const sym = country.currencySymbol;

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<(SkuFormValues & { id: string }) | null>(null);
  const [query, setQuery] = React.useState("");
  const [rankKey, setRankKey] = React.useState<RankKey>("netProfit");

  const filtered = items.filter(
    (it) =>
      it.sku.toLowerCase().includes(query.toLowerCase()) ||
      it.name.toLowerCase().includes(query.toLowerCase()),
  );

  const handleSubmit = (values: SkuFormValues) => {
    if (editing) {
      const { id, ...rest } = editing;
      update(id, rest);
    } else {
      add(values);
    }
    setOpen(false);
    setEditing(null);
  };

  const applyToCalculator = (id: string) => {
    const it = items.find((x) => x.id === id);
    if (!it) return;
    setField("purchaseCost", it.purchaseCost);
    setField("domesticShipping", it.domesticShipping);
    setField("packagingCost", it.packagingCost);
    setField("logisticsMode", "manual"); // 使用 SKU 自带国际物流，避免被按重量推导覆盖
    setField("intlShipping", it.intlShipping);
    setField("otherCost", it.otherCost);
    setField("price", it.price);
    setField("cpa", it.cpa);
    setField("influencerCommissionRate", it.influencerCommissionRate);
    router.push("/");
  };

  const saveCurrent = () => {
    const name = window.prompt("产品名称");
    if (!name) return;
    const sku = window.prompt("SKU 编码（留空自动生成）") || `SKU-${Date.now().toString().slice(-6)}`;
    add({
      sku,
      name,
      purchaseCost: data.purchaseCost,
      domesticShipping: data.domesticShipping,
      packagingCost: data.packagingCost,
      intlShipping: data.intlShipping,
      otherCost: data.otherCost,
      price: data.price,
      cpa: data.cpa,
      influencerCommissionRate: data.influencerCommissionRate,
      note: "从当前利润分析保存",
    });
  };

  // 横向对比：把每个 SKU 当作一行，复用批测引擎按当前平台费率计算并排名
  const compareRows = filtered.map((it) => ({
    sku: it.sku,
    name: it.name,
    purchaseCost: it.purchaseCost,
    logisticsCost: it.intlShipping,
    price: it.price,
    cpa: it.cpa,
    influencerCommissionRate: it.influencerCommissionRate,
  }));
  const compareResults = React.useMemo(
    () => rankBy(computeBatch(compareRows, data, rate), rankKey),
    [compareRows, data, rate, rankKey],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">SKU 成本库</h1>
          <p className="text-sm text-muted-foreground">
            管理每个 SKU 的成本结构，可一键应用到利润分析，或横向对比利润排行。
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadSamples}>
            载入示例
          </Button>
          <Button variant="outline" size="sm" onClick={saveCurrent}>
            <Save className="h-4 w-4" /> 保存当前
          </Button>
          <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="h-4 w-4" /> 新增 SKU
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="搜索 SKU 或名称"
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>名称</TableHead>
                <TableHead className="text-right">采购</TableHead>
                <TableHead className="text-right">国内运</TableHead>
                <TableHead className="text-right">包装</TableHead>
                <TableHead className="text-right">国际物流</TableHead>
                <TableHead className="text-right">其它</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                    <Boxes className="mx-auto mb-2 h-6 w-6 opacity-50" />
                    暂无 SKU，点击「新增 SKU」或「载入示例」。
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((it) => (
                  <TableRow key={it.id}>
                    <TableCell className="font-medium">{it.sku}</TableCell>
                    <TableCell>{it.name}</TableCell>
                    <TableCell className="text-right tabular-nums">¥{formatNumber(it.purchaseCost)}</TableCell>
                    <TableCell className="text-right tabular-nums">¥{formatNumber(it.domesticShipping)}</TableCell>
                    <TableCell className="text-right tabular-nums">¥{formatNumber(it.packagingCost)}</TableCell>
                    <TableCell className="text-right tabular-nums">¥{formatNumber(it.intlShipping)}</TableCell>
                    <TableCell className="text-right tabular-nums">¥{formatNumber(it.otherCost)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="应用到分析" onClick={() => applyToCalculator(it.id)}>
                          <Wand2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="复制" onClick={() => duplicate(it.id)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="编辑" onClick={() => setEditing({ ...it, id: it.id })}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[hsl(var(--danger))]" title="删除" onClick={() => { if (confirm(`确认删除 ${it.sku}？`)) remove(it.id); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filtered.length > 0 ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">横向对比排行</CardTitle>
            <p className="text-xs text-muted-foreground">
              基于当前平台费率与汇率计算，按所选指标降序。点击表头排序。
            </p>
            <div className="flex items-center gap-2 pt-1 text-sm">
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
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>名称</TableHead>
                  <TableHead className="text-right">售价</TableHead>
                  <TableHead className="text-right">净利润</TableHead>
                  <TableHead className="text-right">利润率</TableHead>
                  <TableHead className="text-right">ROI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compareResults.map((r, i) => (
                  <TableRow key={r.sku + i}>
                    <TableCell className="font-semibold text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-medium">{r.sku}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatMoney(r.price, sym)}</TableCell>
                    <TableCell className={`text-right tabular-nums font-medium ${r.netProfit >= 0 ? "text-[hsl(var(--success))]" : "text-[hsl(var(--danger))]"}`}>
                      {formatMoney(r.netProfit, sym)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatPercent(r.profitMargin)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      <Badge variant={r.roi >= 0 ? "success" : "danger"}>{formatPercent(r.roi)}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      <SkuFormDialog
        open={open}
        initial={editing}
        onOpenChange={setOpen}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
