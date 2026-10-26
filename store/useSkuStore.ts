import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SkuItem } from "@/lib/types";
import { SAMPLE_SKUS } from "@/lib/sample";

interface SkuState {
  items: SkuItem[];
  add: (item: Omit<SkuItem, "id" | "createdAt">) => void;
  update: (id: string, patch: Partial<SkuItem>) => void;
  remove: (id: string) => void;
  duplicate: (id: string) => void;
  loadSamples: () => void;
  clear: () => void;
}

const genId = () =>
  `sku_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

const seed = (): SkuItem[] =>
  SAMPLE_SKUS.map((s) => ({ ...s, id: genId(), createdAt: Date.now() }));

export const useSkuStore = create<SkuState>()(
  persist(
    (set) => ({
      // 初始为空：用户数据由 persist 在挂载后 rehydrate 恢复；
      // 这样「载入示例」按钮才有可见效果（否则初始就已塞满示例，点了像没反应）
      items: [],
      add: (item) =>
        set((s) => ({
          items: [{ ...item, id: genId(), createdAt: Date.now() }, ...s.items],
        })),
      update: (id, patch) =>
        set((s) => ({
          items: s.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
        })),
      remove: (id) => set((s) => ({ items: s.items.filter((it) => it.id !== id) })),
      duplicate: (id) =>
        set((s) => {
          const src = s.items.find((it) => it.id === id);
          if (!src) return s;
          const copy: SkuItem = {
            ...src,
            id: genId(),
            sku: `${src.sku}_copy`,
            name: `${src.name} (副本)`,
            createdAt: Date.now(),
          };
          return { items: [copy, ...s.items] };
        }),
      loadSamples: () => set({ items: seed() }),
      clear: () => set({ items: [] }),
    }),
    { name: "tiktok-profit-sku", version: 1, skipHydration: true },
  ),
);
