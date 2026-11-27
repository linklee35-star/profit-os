"use client";

import * as React from "react";
import { useCountUp } from "@/hooks/useCountUp";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: number;
  format: (n: number) => string;
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger" | "primary";
  emphasize?: boolean;
  className?: string;
  secondary?: (n: number) => string;
}

const toneClass: Record<NonNullable<MetricCardProps["tone"]>, string> = {
  default: "text-foreground",
  primary: "text-primary",
  success: "text-[hsl(var(--success))]",
  warning: "text-[hsl(var(--warning))]",
  danger: "text-[hsl(var(--danger))]",
};

export function MetricCard({ label, value, format, hint, tone = "default", emphasize, className, secondary }: MetricCardProps) {
  const animated = useCountUp(value);
  return (
    <div className={cn("min-w-0 px-4 py-3", className)}>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 tabular-nums">
        <span className={cn("block font-semibold leading-tight tracking-tight [overflow-wrap:anywhere]", emphasize ? "text-[clamp(1.65rem,3vw,2.35rem)]" : "text-base", toneClass[tone])}>
          {format(animated)}
        </span>
        {secondary ? <span className="mt-1 block text-xs text-muted-foreground [overflow-wrap:anywhere]">{secondary(animated)}</span> : null}
        {hint ? <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{hint}</span> : null}
      </dd>
    </div>
  );
}
