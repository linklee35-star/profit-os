import type { RateProvider, RateResponse } from "./types";

// ============================================================================
// 汇率客户端 —— 通过自建 API 路由获取，避免浏览器 CORS 与密钥暴露
// 主源 er-api（7×24、币种全），备源 Frankfurter（ECB 权威参考价）
// ============================================================================

export const RATE_PROVIDERS: { id: RateProvider; label: string }[] = [
  { id: "erapi", label: "ExchangeRate · open.er-api.com" },
  { id: "frankfurter", label: "Frankfurter · ECB" },
];

/** 调用本地 API 路由获取汇率（带服务端双源兜底） */
export async function fetchRate(
  provider: RateProvider,
  to = "THB",
): Promise<RateResponse> {
  const res = await fetch(
    `/api/exchange-rate?provider=${provider}&to=${to}`,
    { cache: "no-store" },
  );
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || "汇率获取失败");
  }
  return (await res.json()) as RateResponse;
}
