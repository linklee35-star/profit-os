import Decimal from "decimal.js";

// 财务计算对精度敏感：用 decimal.js 避免 JS 浮点漂移（0.1 + 0.2 ≠ 0.3）
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

/** 将任意输入安全地转为 Decimal（空/NaN/Infinity 视作 0） */
export function D(value: number | string | null | undefined): Decimal {
  if (value === null || value === undefined || value === "") return new Decimal(0);
  const d = new Decimal(Number(value));
  return d.isNaN() || !d.isFinite() ? new Decimal(0) : d;
}

/** 安全求和（任意个数值） */
export function sum(...values: (number | string)[]): Decimal {
  return values.reduce((acc, v) => acc.plus(D(v)), new Decimal(0));
}

/** 将 Decimal/数值四舍五入到 2 位小数（货币单位） */
export function round2(value: Decimal | number): number {
  return Number((typeof value === "number" ? D(value) : value).toFixed(2));
}

/** 百分比（%）转为小数系数，如 5 → 0.05 */
export function pct(value: number): Decimal {
  return D(value).div(100);
}

/**
 * 分摊：把一笔总额按订单数平摊到单件。
 * 若订单数 <= 0，则视为「已按单件填写」，直接返回原值。
 */
export function amortize(total: number, orders: number): number {
  const t = D(total);
  const o = D(orders);
  if (o.lte(0)) return round2(t);
  return round2(t.div(o));
}

/** 受限区间：把 value 夹在 [min, max] */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** 安全除法（分母为 0 返回 0） */
export function safeDiv(numerator: number, denominator: number): number {
  if (!denominator || denominator === 0) return 0;
  return Numerator(numerator).div(denominator).toNumber();
}

function Numerator(n: number): Decimal {
  return D(n);
}
