"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useCountUp } from "@/hooks/useCountUp";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: number;
  format: (n: number) => string;
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger" | "primary";
  emphasize?: boolean;
}

const toneClass: Record<NonNullable<MetricCardProps["tone"]>, string> = {
  default: "text-foreground",
  primary: "text-primary",
  success: "text-[hsl(var(--success))]",
  warning: "text-[hsl(var(--warning))]",
  danger: "text-[hsl(var(--danger))]",
};

export function MetricCard({ label, value, format, hint, tone = "default", emphasize }: MetricCardProps) {
  const animated = useCountUp(value);
  return (
    <Card className={cn("animate-fade-in", emphasize && "border-primary/30 bg-primary/5")}>
      <CardContent className="p-4">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className={cn("mt-1 tabular-nums font-semibold", emphasize ? "text-2xl" : "text-xl", toneClass[tone])}>
          {format(animated)}
        </p>
        {hint ? <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
