"use client";

import dynamic from "next/dynamic";
import * as React from "react";
import { CalculatorModules } from "@/components/modules/CalculatorModules";
import { MetricGrid } from "@/components/dashboard/MetricGrid";
import { CostBreakdownList } from "@/components/dashboard/CostBreakdownList";
import { HealthBanner } from "@/components/dashboard/HealthBanner";
import { MobileResultBar } from "@/components/dashboard/MobileResultBar";
import { Simulator } from "@/components/dashboard/Simulator";
import { ExportBar } from "@/components/dashboard/ExportBar";
import { CategorySelect } from "@/components/CategorySelect";
import { AutosaveIndicator } from "@/components/AutosaveIndicator";
import { ScenarioPanel } from "@/components/ScenarioPanel";
import { useProfit } from "@/hooks/useProfit";
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
  const r = useProfit();
  const resultRef = React.useRef<HTMLDivElement>(null);
  const setData = useInputStore((s) => s.setData);
  const countryCode = useSettingsStore((s) => s.countryCode);

  return (
    <div className="space-y-6 pb-16 xl:pb-0">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">利润分析</h1>
        <p className="text-sm text-muted-foreground">
          实时计算单件净利润、利润率与保本点。左侧填写成本，右侧即时出结果。
        </p>
      </div>

      <CategorySelect />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
        {/* 输入模块 */}
        <CalculatorModules />

        {/* 结果面板 */}
        <div className="space-y-4 xl:sticky xl:top-20 xl:self-start">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setData(buildInitialInput(countryCode))}
              >
                载入示例
              </Button>
              <AutosaveIndicator />
            </div>
            <ExportBar targetRef={resultRef} />
          </div>
          <div ref={resultRef} id="result-panel" className="space-y-4 rounded-xl">
          <HealthBanner health={r.health} margin={r.profitMargin} />
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
        </div>
      </div>
      <MobileResultBar />
    </div>
  );
}
