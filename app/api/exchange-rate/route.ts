import { NextResponse } from "next/server";
import type { RateProvider, RateResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

// 服务端内存缓存：绝大多数请求命中缓存、毫秒返回，彻底摆脱外部网络延迟
interface CacheEntry {
  rate: number;
  updatedAt: string;
  source: RateProvider;
  ts: number;
}
const rateCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 分钟
const FETCH_TIMEOUT_MS = 6000; // 外部源超过 6s 直接放弃，避免卡死

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

async function getRate(provider: RateProvider, to: string) {
  const fetchers: Record<RateProvider, () => Promise<{ rate: number; updatedAt: string }>> = {
    erapi: () => fetchErApi(to),
    frankfurter: () => fetchFrankfurter(to),
  };
  // 先尝试所选源，失败则自动切换另一个源（双源兜底）
  const order: RateProvider[] =
    provider === "erapi" ? ["erapi", "frankfurter"] : ["frankfurter", "erapi"];
  let lastErr: unknown;
  for (const p of order) {
    try {
      const r = await fetchers[p]();
      return { ...r, source: p } as { rate: number; updatedAt: string; source: RateProvider };
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("all rate sources failed");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provider = (searchParams.get("provider") as RateProvider) || "erapi";
  const to = searchParams.get("to") || "THB";
  const cacheKey = `${provider}:${to}`;
  const cached = rateCache.get(cacheKey);

  // 命中且未过期：直接返回，零外部网络开销
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    const body: RateResponse = {
      source: cached.source,
      from: "CNY",
      to,
      rate: cached.rate,
      updatedAt: cached.updatedAt,
    };
    return NextResponse.json(body);
  }

  try {
    const { rate, updatedAt, source } = await getRate(provider, to);
    rateCache.set(cacheKey, { rate, updatedAt, source, ts: Date.now() });
    const body: RateResponse = { source, from: "CNY", to, rate, updatedAt };
    return NextResponse.json(body);
  } catch (e) {
    // 外部全失败时，降级返回仍缓存的旧值（保证计算不中断）
    if (cached) {
      return NextResponse.json({
        source: cached.source,
        from: "CNY",
        to,
        rate: cached.rate,
        updatedAt: cached.updatedAt,
      });
    }
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
