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
    <Card className={cn("animate-fade-in min-w-0", emphasize && "border-primary/35")}>
      <CardContent className="p-4">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p
          className={cn(
            "mt-1 tabular-nums font-semibold break-words leading-tight",
            emphasize ? "text-xl sm:text-2xl" : "text-lg sm:text-xl",
            toneClass[tone],
          )}
          title={format(animated)}
        >
          {format(animated)}
        </p>
        {hint ? <p className="mt-1 text-[11px] break-words text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
