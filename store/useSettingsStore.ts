import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CountryCode, Mode, PlatformId, RateProvider, RateSource } from "@/lib/types";
import { getCountry } from "@/lib/countries";
import { getPlatformsForCountry } from "@/lib/fees";
import { applyCountryDefaults } from "@/lib/schema";
import { useInputStore } from "./useInputStore";

interface SettingsState {
  mode: Mode;
  countryCode: CountryCode;
  platformId: PlatformId;
  rateSource: RateSource;
  rateProvider: RateProvider;
  manualRate: number;
  autoRate: number | null;
  autoRateUpdatedAt: string | null;
  setMode: (m: Mode) => void;
  setCountry: (c: CountryCode) => void;
  setPlatform: (p: PlatformId) => void;
  setRateSource: (s: RateSource) => void;
  setRateProvider: (p: RateProvider) => void;
  setManualRate: (r: number) => void;
  setAutoRate: (rate: number, updatedAt: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      mode: "quick",
      countryCode: "TH",
      platformId: "tiktok-shop",
      rateSource: "auto",
      rateProvider: "erapi",
      manualRate: 5.0,
      autoRate: null,
      autoRateUpdatedAt: null,

      setMode: (mode) => set({ mode }),

      // 切换国家：用该国默认值覆盖平台费用 / VAT / 汇率（核心引擎无需改动）
      // 若新国家没有当前平台的费率数据，自动切到该国首个可用平台，避免套用错误默认值
      setCountry: (countryCode) => {
        const country = getCountry(countryCode);
        const available = getPlatformsForCountry(countryCode);
        const current = useSettingsStore.getState().platformId;
        const platformId = available.includes(current) ? current : available[0] ?? current;
        const cur = useInputStore.getState().data;
        useInputStore.getState().setData(applyCountryDefaults(cur, country, platformId));
        set({ countryCode, platformId });
      },

      // 切换平台：按「新平台 × 当前国家」重新套用费率数据
      setPlatform: (platformId) => {
        const countryCode = useSettingsStore.getState().countryCode;
        const cur = useInputStore.getState().data;
        useInputStore
          .getState()
          .setData(applyCountryDefaults(cur, getCountry(countryCode), platformId));
        set({ platformId });
      },

      setRateSource: (rateSource) => set({ rateSource }),
      setRateProvider: (rateProvider) => set({ rateProvider }),
      setManualRate: (manualRate) => set({ manualRate }),
      setAutoRate: (autoRate, autoRateUpdatedAt) => set({ autoRate, autoRateUpdatedAt }),
    }),
    { name: "tiktok-profit-settings", version: 1, skipHydration: true },
  ),
);

export const currentCountry = () => getCountry(useSettingsStore.getState().countryCode);
export const currentPlatform = () => useSettingsStore.getState().platformId;
