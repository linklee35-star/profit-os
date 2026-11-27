"use client";

import { useState } from "react";
import { ArrowUpRight, Copy, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEffectiveRate, useProfit } from "@/hooks/useProfit";
import { getCountry } from "@/lib/countries";
import { formatMoney, formatPercent } from "@/lib/format";
import { getPlatform } from "@/lib/platforms";
import { useInputStore } from "@/store/useInputStore";
import { useSettingsStore } from "@/store/useSettingsStore";

const MCP_GUIDE = "https://github.com/linklee35-star/profit-os/blob/main/mcp/README.md";

export function AgentAccess() {
  const [copyStatus, setCopyStatus] = useState("");
  const country = getCountry(useSettingsStore((state) => state.countryCode));
  const platform = getPlatform(useSettingsStore((state) => state.platformId));
  const data = useInputStore((state) => state.data);
  const rate = useEffectiveRate();
  const result = useProfit();
  const money = (amount: number) => formatMoney(amount, country.currencySymbol);
  const market = `${platform.name} · ${country.name}站（${country.currency}）`;
  const prompt = [
    "帮我分析这笔订单的主要成本，并给出可试算的调价或降成本方案。",
    `销售站点：${market}（${platform.id} / ${country.code}）`,
    `网页结果：售价 ${money(data.price)}，单件净利 ${money(result.netProfit)}，利润率 ${formatPercent(result.profitMargin)}，总成本 ${money(result.totalCost)}。`,
    "换算方向为 1 CNY = rate 单位站点币种。若使用 Margin OS MCP，请保留自定义成本与费率，并说明工具无法直接录入的字段。",
    "",
    "当前测算输入：",
    JSON.stringify({ ...data, rate }, null, 2),
  ].join("\n");

  async function copyCalculation() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyStatus("已复制当前测算，可粘贴到 Agent");
    } catch {
      setCopyStatus("剪贴板不可用，请从下方选择并复制");
    }
  }

  return (
    <Dialog onOpenChange={(open) => { if (!open) setCopyStatus(""); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="shrink-0 border-primary/25 bg-accent text-accent-foreground">
          <Plug aria-hidden="true" /> 交给 Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto rounded-lg">
        <DialogHeader className="pr-5">
          <DialogTitle>交给 Agent</DialogTitle>
          <DialogDescription>复制当前输入和利润结果，用于分析成本、讨论定价或继续试算。</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <label htmlFor="agent-calculation" className="text-sm font-medium">{market}</label>
          <textarea id="agent-calculation" className="block h-32 w-full rounded-md border border-input bg-background p-3 text-sm leading-relaxed" readOnly value={prompt} />
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={copyCalculation}><Copy aria-hidden="true" /> 复制当前测算</Button>
            <span role="status" className="text-xs text-muted-foreground">{copyStatus}</span>
          </div>
        </div>
        <div className="space-y-2 border-t border-border pt-4">
          <h3 className="text-sm font-semibold">MCP 本地接入</h3>
          <p className="text-sm text-muted-foreground">在支持 MCP 的 Agent 客户端配置 Margin OS 后，可直接调用利润计算、目标定价和跨市场对比工具。</p>
          <Button asChild variant="link" className="h-auto px-0">
            <a href={MCP_GUIDE} target="_blank" rel="noreferrer">查看接入说明 <ArrowUpRight aria-hidden="true" /></a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
