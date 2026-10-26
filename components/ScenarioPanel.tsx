"use client";

import { Save, FolderOpen, Trash2 } from "lucide-react";
import { useInputStore } from "@/store/useInputStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ScenarioPanel() {
  const scenarios = useInputStore((s) => s.scenarios);
  const saveScenario = useInputStore((s) => s.saveScenario);
  const loadScenario = useInputStore((s) => s.loadScenario);
  const deleteScenario = useInputStore((s) => s.deleteScenario);

  const onSave = () => {
    const name = window.prompt("方案名称（如：A 保守投流 / B 激进投流）");
    if (name && name.trim()) saveScenario(name.trim());
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">预设方案</CardTitle>
        <Button size="sm" variant="outline" onClick={onSave}>
          <Save className="h-4 w-4" />
          保存当前
        </Button>
      </CardHeader>
      <CardContent>
        {scenarios.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            暂无方案。调好一套参数后点「保存当前」，可留存多套方案随时切换对比。
          </p>
        ) : (
          <ul className="space-y-1.5">
            {scenarios.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    售价 {s.data.price} · CPA {s.data.cpa} · 佣金 {s.data.influencerCommissionRate}%
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button size="sm" variant="ghost" onClick={() => loadScenario(s.id)}>
                    <FolderOpen className="h-4 w-4" />
                    载入
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-[hsl(var(--danger))]"
                    onClick={() => deleteScenario(s.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
