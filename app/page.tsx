"use client";

import dynamic from "next/dynamic";
import * as React from "react";
import { CalculatorModules } from "@/components/modules/CalculatorModules";
import { MetricGrid } from "@/components/dashboard/MetricGrid";
import { AgentAccess } from "@/components/dashboard/AgentAccess";
import { CostBreakdownList } from "@/components/dashboard/CostBreakdownList";
import { MobileResultBar } from "@/components/dashboard/MobileResultBar";
import { Simulator } from "@/components/dashboard/Simulator";
import { ExportBar } from "@/components/dashboard/ExportBar";
import { CategorySelect } from "@/components/CategorySelect";
import { AutosaveIndicator } from "@/components/AutosaveIndicator";
import { ScenarioPanel } from "@/components/ScenarioPanel";
import { useInputStore } from "@/store/useInputStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { buildInitialInput } from "@/lib/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

function ChartSkeleton({ h = 280 }: { h?: number }) {
  return (
    <div
      className="w-full animate-pulse rounded-lg bg-muted/50"
      style={{ height: h }}
    />
  );
}

const CostDonut = dynamic(() => import("@/components/dashboard/CostDonut"), {
  ssr: false,
  loading: () => <ChartSkeleton h={300} />,
});
const PriceBreakdown = dynamic(() => import("@/components/dashboard/PriceBreakdown"), {
  ssr: false,
  loading: () => <ChartSkeleton h={80} />,
});
const ProfitCurve = dynamic(() => import("@/components/dashboard/ProfitCurve"), {
  ssr: false,
  loading: () => <ChartSkeleton h={280} />,
});

export default function DashboardPage() {
  const resultRef = React.useRef<HTMLDivElement>(null);
  const setData = useInputStore((s) => s.setData);
  const countryCode = useSettingsStore((s) => s.countryCode);
  const platformId = useSettingsStore((s) => s.platformId);

  return (
    <div className="space-y-5 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] lg:space-y-6 lg:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4 sm:items-center">
        <div className="space-y-1">
          <h1 className="text-[1.65rem] font-semibold leading-tight tracking-tight sm:text-[1.875rem]">利润分析</h1>
          <p className="text-sm text-muted-foreground">按单测算净利润、保本售价和广告空间。</p>
        </div>
        <AgentAccess />
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.8fr)] xl:grid-cols-[minmax(0,1fr)_440px]">
        <section className="min-w-0 space-y-3" aria-labelledby="calculator-parameters">
          <h2 id="calculator-parameters" className="text-base font-semibold">测算参数</h2>
          <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border bg-card p-4">
            <CategorySelect />
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setData(buildInitialInput(countryCode, platformId))}>
                载入示例
              </Button>
              <AutosaveIndicator />
            </div>
          </div>
          <CalculatorModules />
        </section>
        <section className="min-w-0 space-y-3 lg:sticky lg:top-[4.75rem] lg:self-start" aria-labelledby="calculator-results">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="calculator-results" className="text-base font-semibold">测算结果</h2>
            <ExportBar targetRef={resultRef} />
          </div>
          <div ref={resultRef} id="result-panel" className="min-w-0 scroll-mt-28 space-y-4 rounded-lg">
            <MetricGrid />
            <CostBreakdownList />

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">数据分析</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="donut">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="donut">成本结构</TabsTrigger>
                    <TabsTrigger value="breakdown">售价拆解</TabsTrigger>
                    <TabsTrigger value="curve">利润曲线</TabsTrigger>
                  </TabsList>
                  <TabsContent value="donut">
                    <CostDonut />
                  </TabsContent>
                  <TabsContent value="breakdown">
                    <PriceBreakdown />
                  </TabsContent>
                  <TabsContent value="curve">
                    <ProfitCurve />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">利润模拟器</CardTitle>
              </CardHeader>
              <CardContent>
                <Simulator />
              </CardContent>
            </Card>

            <ScenarioPanel />
          </div>
        </section>
      </div>
      <MobileResultBar />
    </div>
  );
}
