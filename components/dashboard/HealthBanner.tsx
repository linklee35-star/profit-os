"use client";

import * as React from "react";
import { HEALTH_META } from "@/lib/pricing-engine";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { HealthLevel } from "@/lib/types";

const badgeVariant: Record<HealthLevel, "danger" | "warning" | "success"> = {
  danger: "danger",
  warning: "warning",
  healthy: "success",
  excellent: "success",
};

export function HealthBanner({ health, margin }: { health: HealthLevel; margin: number }) {
  const meta = HEALTH_META[health];
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between",
        health === "danger" && "border-[hsl(var(--danger))]/30 bg-[hsl(var(--danger))]/5",
        health === "warning" && "border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/5",
        (health === "healthy" || health === "excellent") && "border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/5",
      )}
    >
      <div className="flex items-center gap-3">
        <Badge variant={badgeVariant[health]}>{meta.label}</Badge>
        <span className="text-sm text-muted-foreground">{meta.desc}</span>
      </div>
      <span className="text-sm font-medium tabular-nums">
        利润率 {margin.toFixed(1)}%
      </span>
    </div>
  );
}
