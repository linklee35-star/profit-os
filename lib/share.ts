import type { CountryCode, PlatformId, ProfitInput } from "./types";
import { applyCountryDefaults, buildInitialInput } from "./schema";
import { getCountry, getCountryCodes } from "./countries";
import { getPlatformIds } from "./platforms";

// ============================================================================
// share —— 把当前输入编码进 URL，让「把这份测算发给同事」成为一条链接
//
// 为什么是 URL 而不是服务端：本站是纯静态 PWA，没有后端也没有账号，
// URL 是唯一不需要服务器就能传递完整状态的信道。
//
// 编码策略：以「该国 × 该平台」的默认值为基线，只写差异字段
//   - 差异为空时链接极短（用默认值算的链接只有几十个字符）
//   - 按 key 存而不是按位置存：以后新增字段不会让老链接错位，
//     解码时未知 key 直接忽略，老链接永远能打开
// ============================================================================

/** URL 参数名 */
export const SHARE_PARAM = "s";

/** 载荷版本：结构变更时递增，老链接会被安全忽略而不是解析出错 */
const SHARE_VERSION = 1;

/** 超过这个长度直接拒绝解码，避免有人塞垃圾进 URL */
const MAX_TOKEN_LENGTH = 4000;

type Scalar = number | string | boolean;
type DiffValue = Scalar | Record<string, number>;

interface SharePayload {
  v: number;
  c: CountryCode;
  p: PlatformId;
  d: Record<string, DiffValue>;
}

/** UTF-8 字符串 → base64url（浏览器与 Node 通用，不依赖 Buffer） */
export function toBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let bin = "";
  for (const byte of bytes) bin += String.fromCharCode(byte);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** base64url → UTF-8 字符串 */
export function fromBase64Url(token: string): string {
  const b64 = token.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const bin = atob(b64 + pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/** 该「国家 × 平台」组合的默认输入，作为差异编码的基线 */
export function baselineFor(
  countryCode: CountryCode,
  platformId: PlatformId,
): ProfitInput {
  return applyCountryDefaults(
    buildInitialInput(countryCode),
    getCountry(countryCode),
    platformId,
  );
}

function sameNumberMap(
  a: Record<string, number> | undefined,
  b: Record<string, number> | undefined,
): boolean {
  if (!a || !b) return a === b;
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  return ak.every((k) => a[k] === b[k]);
}

/** 输入 → 可放进 URL 的 token */
export function encodeShareState(
  data: ProfitInput,
  countryCode: CountryCode,
  platformId: PlatformId,
): string {
  const base = baselineFor(countryCode, platformId);
  const diff: Record<string, DiffValue> = {};

  for (const key of Object.keys(base) as (keyof ProfitInput)[]) {
    if (key === "platformFeeValues") {
      if (data.platformFeeValues && !sameNumberMap(data.platformFeeValues, base.platformFeeValues)) {
        diff.platformFeeValues = { ...data.platformFeeValues };
      }
      continue;
    }
    const current = data[key];
    if (current === undefined) continue;
    if (current !== base[key]) diff[key] = current as Scalar;
  }

  const payload: SharePayload = {
    v: SHARE_VERSION,
    c: countryCode,
    p: platformId,
    d: diff,
  };
  return toBase64Url(JSON.stringify(payload));
}

export interface DecodedShare {
  data: ProfitInput;
  countryCode: CountryCode;
  platformId: PlatformId;
}

/**
 * token → 输入。任何不合法的输入都返回 null，调用方按「没有分享参数」处理，
 * 绝不让一条坏链接把页面搞崩。
 */
export function decodeShareState(token: string | null | undefined): DecodedShare | null {
  if (!token || token.length > MAX_TOKEN_LENGTH) return null;

  let payload: SharePayload;
  try {
    payload = JSON.parse(fromBase64Url(token)) as SharePayload;
  } catch {
    return null;
  }

  if (!payload || typeof payload !== "object") return null;
  if (payload.v !== SHARE_VERSION) return null;
  if (!getCountryCodes().includes(payload.c)) return null;
  if (!getPlatformIds().includes(payload.p)) return null;

  const data: ProfitInput = { ...baselineFor(payload.c, payload.p) };
  const diff = payload.d && typeof payload.d === "object" ? payload.d : {};

  for (const [key, value] of Object.entries(diff)) {
    // 未知字段（例如新版加了字段、老链接里没有）一律忽略
    if (!(key in data)) continue;

    if (key === "platformFeeValues") {
      if (!value || typeof value !== "object" || Array.isArray(value)) continue;
      const cleaned: Record<string, number> = {};
      for (const [feeKey, feeValue] of Object.entries(value)) {
        if (typeof feeValue === "number" && Number.isFinite(feeValue)) {
          cleaned[feeKey] = feeValue;
        }
      }
      data.platformFeeValues = cleaned;
      continue;
    }

    const fallback = data[key as keyof ProfitInput];
    // 类型必须与基线一致，防止手改 URL 把字符串塞进数字字段
    if (typeof value !== typeof fallback) continue;
    if (typeof value === "number" && !Number.isFinite(value)) continue;
    (data as unknown as Record<string, unknown>)[key] = value;
  }

  return { data, countryCode: payload.c, platformId: payload.p };
}

/** 从 location.search 里取出 token */
export function readShareToken(search: string): string | null {
  if (!search) return null;
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  return params.get(SHARE_PARAM);
}

/** 把 token 拼到当前地址上（保留 basePath 等已有路径） */
export function buildShareUrl(href: string, token: string): string {
  const url = new URL(href);
  url.searchParams.set(SHARE_PARAM, token);
  return url.toString();
}

/** 去掉地址里的分享参数，用于应用完链接后清理地址栏 */
export function stripShareParam(href: string): string {
  const url = new URL(href);
  url.searchParams.delete(SHARE_PARAM);
  return url.toString();
}
