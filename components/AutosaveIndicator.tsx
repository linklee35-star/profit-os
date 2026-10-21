"use client";

import { useInputStore } from "@/store/useInputStore";
import { formatTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

export function AutosaveIndicator() {
  const lastSavedAt = useInputStore((s) => s.lastSavedAt);
  const reset = useInputStore((s) => s.reset);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">
        {lastSavedAt ? `已保存 ${formatTime(new Date(lastSavedAt).toISOString())}` : "自动保存已开启"}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          if (confirm("恢复为默认参数？当前输入将被清空。")) reset();
        }}
        title="恢复默认"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        恢复默认
      </Button>
    </div>
  );
}
