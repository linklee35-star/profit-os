"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSettingsStore } from "@/store/useSettingsStore";
import { cn } from "@/lib/utils";

interface ModuleCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  /** 高级模块：快速模式下隐藏 */
  advanced?: boolean;
  /** 标题右侧控件（如模块开关），始终可交互 */
  right?: React.ReactNode;
  /** 模块被关闭时，内容区置灰（控件本身仍可用） */
  disabled?: boolean;
  /** 成本异常内联预警（红色/琥珀提示条） */
  warning?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * 模块卡片容器。advanced=true 的模块仅在「真实利润模式」下渲染，
 * 满足「快速模式只显示核心成本」的要求。
 */
export function ModuleCard({
  title,
  description,
  icon,
  advanced,
  right,
  disabled,
  warning,
  className,
  children,
}: ModuleCardProps) {
  const mode = useSettingsStore((s) => s.mode);
  if (advanced && mode === "quick") return null;

  return (
    <Card className={cn("animate-fade-in", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {icon ? <span className="text-primary">{icon}</span> : null}
          <CardTitle className="text-base">{title}</CardTitle>
          {advanced ? (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              高级
            </span>
          ) : null}
          {right ? <div className="ml-auto">{right}</div> : null}
        </div>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      {warning ? (
        <div
          className="mx-4 mb-2 flex items-center gap-2 rounded-md border border-[hsl(var(--warning))]/40 bg-[hsl(var(--warning))]/10 px-3 py-1.5 text-xs text-[hsl(var(--warning))]"
          role="alert"
        >
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>{warning}</span>
        </div>
      ) : null}
      <CardContent
        className={cn(
          "grid grid-cols-1 gap-3 sm:grid-cols-2",
          disabled && "opacity-50",
        )}
      >
        {children}
      </CardContent>
    </Card>
  );
}

