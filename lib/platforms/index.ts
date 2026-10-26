import type { PlatformFeeSchema, PlatformId } from "../types";
import { tiktokShop } from "./tiktok-shop";
import { shopee } from "./shopee";

// ============================================================================
// 平台注册表 —— 新增平台只需：
//   1. 新建 lib/platforms/<platform>.ts 导出 PlatformFeeSchema
//   2. 在此 import 并加入下方 registry
// 核心利润引擎无需任何改动
// ============================================================================

const registry: Record<PlatformId, PlatformFeeSchema> = {
  "tiktok-shop": tiktokShop,
  shopee,
};

export const platforms: PlatformFeeSchema[] = Object.values(registry);

export function getPlatform(id: PlatformId): PlatformFeeSchema {
  return registry[id];
}

export function getPlatformIds(): PlatformId[] {
  return Object.keys(registry) as PlatformId[];
}
