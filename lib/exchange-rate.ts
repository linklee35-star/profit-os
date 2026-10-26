import type { RateProvider, RateResponse } from "./types";

// ============================================================================
// 汇率客户端 —— 静态部署（GitHub Pages）下浏览器直连双源
//   主源 er-api（免费无 key、币种全、CORS 开放）
//   备源 Frankfurter（ECB 权威参考价，CORS 开放）
// 浏览器 localStorage 缓存 10 分钟；断网时调用方回退上次成功值/国家默认汇率
// ============================================================================

export const RATE_PROVIDERS: { id: RateProvider; label: string }[] = [
  { id: "erapi", label: "ExchangeRate · open.er-api.com" },
  { id: "frankfurter", label: "Frankfurter · ECB" },
];

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 分钟
const FETCH_TIMEOUT_MS = 6000; // 外部源超过 6s 直接放弃

async function fetchWithTimeout(url: string): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { cache: "no-store", signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

// 主源：open.er-api.com（免费、无需 key、币种全）
async function fetchErApi(to: string): Promise<{ rate: number; updatedAt: string }> {
  const res = await fetchWithTimeout("https://open.er-api.com/v6/latest/CNY");
  if (!res.ok) throw new Error("er-api request failed");
  const json = await res.json();
  if (json.result !== "success" || !json.rates?.[to]) {
    throw new Error("er-api invalid payload");
  }
  return {
    rate: Number(json.rates[to]),
    updatedAt: json.time_last_update_utc
      ? new Date(json.time_last_update_utc).toISOString()
      : new Date().toISOString(),
  };
}

// 备源：Frankfurter（ECB 参考价）
async function fetchFrankfurter(to: string): Promise<{ rate: number; updatedAt: string }> {
  const res = await fetchWithTimeout(`https://api.frankfurter.app/latest?from=CNY&to=${to}`);
  if (!res.ok) throw new Error("frankfurter request failed");
  const json = await res.json();
  if (!json.rates?.[to]) throw new Error("frankfurter invalid payload");
  return {
    rate: Number(json.rates[to]),
    updatedAt: json.date ? new Date(json.date).toISOString() : new Date().toISOString(),
  };
}

/** 浏览器本地缓存（静态部署替代原服务端缓存） */
function readCache(provider: RateProvider, to: string): RateResponse | null {
  try {
    const raw = localStorage.getItem(`rate-cache:${provider}:${to}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RateResponse & { cachedAt: number };
    if (Date.now() - parsed.cachedAt > CACHE_TTL_MS) return null;
    return {
      source: parsed.source,
      from: "CNY",
      to,
      rate: parsed.rate,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return null;
  }
}

function writeCache(provider: RateProvider, to: string, r: RateResponse): void {
  try {
    localStorage.setItem(
      `rate-cache:${provider}:${to}`,
      JSON.stringify({ ...r, cachedAt: Date.now() }),
    );
  } catch {
    // 存储配额满等情况静默忽略
  }
}

/** 直连双源获取汇率：先所选源，失败自动切换另一个源（双源兜底） */
export async function fetchRate(
  provider: RateProvider,
  to = "THB",
): Promise<RateResponse> {
  const cached = readCache(provider, to);
  if (cached) return cached;

  const fetchers: Record<RateProvider, () => Promise<{ rate: number; updatedAt: string }>> = {
    erapi: () => fetchErApi(to),
    frankfurter: () => fetchFrankfurter(to),
  };
  const order: RateProvider[] =
    provider === "erapi" ? ["erapi", "frankfurter"] : ["frankfurter", "erapi"];

  let lastErr: unknown;
  for (const p of order) {
    try {
      const r = await fetchers[p]();
      const result: RateResponse = {
        source: p,
        from: "CNY",
        to,
        rate: r.rate,
        updatedAt: r.updatedAt,
      };
      writeCache(provider, to, result);
      return result;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("all rate sources failed");
}
