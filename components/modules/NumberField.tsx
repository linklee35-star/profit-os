"use client";

import { useInputStore } from "@/store/useInputStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/ui/numeric-input";
import { cn } from "@/lib/utils";
import type { ProfitInput } from "@/lib/types";

interface NumberFieldProps {
  field: keyof ProfitInput;
  label: string;
  suffix?: string; // 如 "%" 或 "฿"
  prefix?: string; // 如 "¥"
  hint?: string;
  step?: number;
  min?: number;
  max?: number;
  /** 高级字段：快速模式下隐藏 */
  advanced?: boolean;
  /** 禁用（如所属模块被关闭时） */
  disabled?: boolean;
}

/**
 * 受 store 控制的数字输入。所有改动即时写入 useInputStore，
 * 由 useProfit 统一重算 —— 输入与计算解耦，且无需表单提交即可实时联动。
 * 底层数值文本框使用 NumericInput，避免「0 残留」与小数输入干扰。
 */
export function NumberField({
  field,
  label,
  suffix,
  prefix,
  hint,
  step = 0.1,
  min,
  max,
  advanced,
  disabled,
}: NumberFieldProps) {
  const value = useInputStore((s) => s.data[field]);
  const setField = useInputStore((s) => s.setField);
  const mode = useSettingsStore((s) => s.mode);
  if (advanced && mode === "quick") return null;
  const safeValue = typeof value === "number" ? value : 0;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={field}>
        {label}
        {suffix ? (
          <span className="ml-1 text-xs font-normal text-muted-foreground">({suffix})</span>
        ) : null}
      </Label>
      <div className="relative">
        {prefix ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {prefix}
          </span>
        ) : null}
        <NumericInput
          id={field}
          className={cn(prefix && "pl-7", suffix && "pr-9")}
          placeholder=""
          step={step}
          min={min}
          max={max}
          disabled={disabled}
          value={safeValue}
          onValueChange={(n) => setField(field, n)}
          aria-label={label}
        />
        {suffix && !prefix ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {suffix}
          </span>
        ) : null}
      </div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
