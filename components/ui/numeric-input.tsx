"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

interface NumericInputProps {
  value: number;
  onValueChange: (n: number) => void;
  id?: string;
  placeholder?: string;
  className?: string;
  step?: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

/**
 * 受控数字输入：修复「清空到 0 后重新输入数字、前导 0 依旧残留」的问题。
 *
 * - 使用本地文本状态，聚焦时完全由用户控制，允许临时为空（不会被回写成 "0"）。
 * - 外部值变化（模式/国家切换、SKU 应用）在失焦态同步到文本框。
 * - 失焦时规范化：空 → 0，保留有效数字，避免 "05" 这类残留。
 * - type=text + inputMode=decimal，规避原生 number 对 "1." 等小数中间态的清空干扰。
 */
export const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  function NumericInput({ value, onValueChange, disabled, ...rest }, ref) {
    const [text, setText] = React.useState<string>(() =>
      value === 0 ? "" : String(value),
    );
    const [focused, setFocused] = React.useState(false);

    React.useEffect(() => {
      if (!focused) setText(value === 0 ? "" : String(value));
    }, [value, focused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setText(v);
      if (v === "" || v === "-") {
        onValueChange(0);
        return;
      }
      const n = Number(v);
      if (Number.isFinite(n)) onValueChange(n);
    };

    const commit = () => {
      setFocused(false);
      const n = text === "" ? 0 : Number(text);
      const clean = Number.isFinite(n) ? n : 0;
      setText(clean === 0 ? "" : String(clean));
      onValueChange(clean);
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        disabled={disabled}
        {...rest}
        value={text}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={commit}
      />
    );
  },
);
