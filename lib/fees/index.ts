import type { CountryCode, PlatformCountryFees, PlatformId } from "../types";
import { tiktokShopTH } from "./tiktok-shop-th";
import { tiktokShopVN } from "./tiktok-shop-vn";

// ============================================================================
// 费率数据注册表 —— 新增「平台 × 国家」只需：
//   1. 新建 lib/fees/<platform>-<country>.ts 导出 PlatformCountryFees
//   2. 在此 import 并加入下方 registry
// ============================================================================

const registry: PlatformCountryFees[] = [tiktokShopTH, tiktokShopVN];

/** 取某平台在某国的费率数据（无数据返回 undefined，调用方负责兜底） */
export function getPlatformFees(
  platform: PlatformId,
  country: CountryCode,
): PlatformCountryFees | undefined {
  return registry.find((f) => f.platform === platform && f.country === country);
}

/** 某国家已接入的平台列表 */
export function getPlatformsForCountry(country: CountryCode): PlatformId[] {
  return registry.filter((f) => f.country === country).map((f) => f.platform);
}

export const feeData: PlatformCountryFees[] = registry;
