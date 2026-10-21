// 展示层格式化工具（与计算无关，纯展示）

export function formatMoney(value: number, symbol = "฿", digits = 2): string {
  const n = Number.isFinite(value) ? value : 0;
  return `${symbol}${n.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

export function formatNumber(value: number, digits = 2): string {
  const n = Number.isFinite(value) ? value : 0;
  return n.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatPercent(value: number, digits = 1): string {
  const n = Number.isFinite(value) ? value : 0;
  return `${n.toFixed(digits)}%`;
}

export function formatRate(value: number, digits = 4): string {
  const n = Number.isFinite(value) ? value : 0;
  return n.toFixed(digits);
}

export function formatTime(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * 目标币种金额附带「换算后的人民币」：฿1,234.00 (¥246.80)
 * rate 为 CNY→目标币种，故 目标币种→RMB = value / rate。
 */
export function formatThbWithRmb(
  value: number,
  rate: number,
  sym = "฿",
  digits = 2,
): string {
  const v = Number.isFinite(value) ? value : 0;
  const rmb = rate > 0 ? v / rate : 0;
  return `${sym}${formatNumber(v, digits)} (¥${formatNumber(rmb, digits)})`;
}