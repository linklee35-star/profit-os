import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProfitInput } from "@/lib/types";
import { buildInitialInput, applyCountryDefaults } from "@/lib/schema";
import { applyCategory as applyCategoryFn } from "@/lib/categories";
import { getCountry } from "@/lib/countries";

export interface Scenario {
  id: string;
  name: string;
  data: ProfitInput;
  savedAt: number;
}

interface InputState {
  data: ProfitInput;
  lastSavedAt: number | null; // 自动保存时间戳（用于「已保存」提示）
  scenarios: Scenario[]; // 预设方案
  setField: <K extends keyof ProfitInput>(key: K, value: ProfitInput[K]) => void;
  setData: (data: ProfitInput) => void;
  reset: () => void;
  applyCategory: (categoryId: string) => void;
  applyCountry: (code: ProfitInput["category"] extends never ? string : string) => void;
  saveScenario: (name: string) => void;
  loadScenario: (id: string) => void;
  deleteScenario: (id: string) => void;
}

const genId = () =>
  `sc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

export const useInputStore = create<InputState>()(
  persist(
    (set) => ({
      data: buildInitialInput("TH"),
      lastSavedAt: null,
      scenarios: [],
      setField: (key, value) =>
        set((s) => ({ data: { ...s.data, [key]: value }, lastSavedAt: Date.now() })),
      setData: (data) => set({ data, lastSavedAt: Date.now() }),
      reset: () => set({ data: buildInitialInput("TH"), lastSavedAt: Date.now() }),
      applyCategory: (categoryId) =>
        set((s) => ({
          data: applyCategoryFn(s.data, categoryId),
          lastSavedAt: Date.now(),
        })),
      applyCountry: (code) =>
        set((s) => ({
          data: applyCountryDefaults(s.data, getCountry(code as "TH")),
          lastSavedAt: Date.now(),
        })),
      saveScenario: (name) =>
        set((s) => ({
          scenarios: [
            { id: genId(), name, data: s.data, savedAt: Date.now() },
            ...s.scenarios,
          ],
          lastSavedAt: Date.now(),
        })),
      loadScenario: (id) =>
        set((s) => {
          const sc = s.scenarios.find((x) => x.id === id);
          return sc ? { data: sc.data, lastSavedAt: Date.now() } : s;
        }),
      deleteScenario: (id) =>
        set((s) => ({ scenarios: s.scenarios.filter((x) => x.id !== id) })),
    }),
    { name: "tiktok-profit-input", version: 4, skipHydration: true,
      migrate: (persisted: any) => {
        // v3→v4：更新平台费率到 2026-05-06 后真实值，补全新字段
        const s = persisted?.state ?? persisted;
        return {
          ...persisted,
          state: {
            ...s,
            data: {
              ...s.data,
              commissionRate: 7.49,
              transactionRate: 3.21,
              growthRate: 8.03,
              infrastructureFee: 1.07,
              dutyEnabled: s.data?.dutyEnabled ?? false,
              dutyCategory: s.data?.dutyCategory ?? "general",
              dutyRate: s.data?.dutyRate ?? 10,
              targetPricingMode: s.data?.targetPricingMode ?? "profit",
              targetProfit: s.data?.targetProfit ?? 0,
              targetMargin: s.data?.targetMargin ?? 20,
            },
          },
          version: 4,
        };
      },
    },
  ),
);
