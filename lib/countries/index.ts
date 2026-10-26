import type { CountryCode, CountryConfig } from "@/lib/types";
import { thailand } from "./thailand";

// ============================================================================
// 国家注册表 —— 新增国家只需：
//   1. 新建 lib/countries/<country>.ts 导出 CountryConfig
//   2. 在此 import 并加入下方 registry
// 核心利润引擎（profit-engine / fee-engine / pricing-engine）无需任何改动
// ============================================================================

const registry: Record<CountryCode, CountryConfig> = {
  TH: thailand,
};

export const countries: CountryConfig[] = Object.values(registry);

export function getCountry(code: CountryCode): CountryConfig {
  return registry[code];
}

export function getCountryCodes(): CountryCode[] {
  return Object.keys(registry) as CountryCode[];
}
