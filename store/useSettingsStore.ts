import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CountryCode, Mode, PlatformId, RateProvider, RateSource } from "@/lib/types";
import { getCountry } from "@/lib/countries";
import { getPlatformFees, getPlatformsForCountry } from "@/lib/fees";
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
  setMarket: (countryCode: CountryCode, platformId: PlatformId) => boolean;
  setRateSource: (s: RateSource) => void;
  setRateProvider: (p: RateProvider) => void;
  setManualRate: (r: number) => void;
  setAutoRate: (rate: number, updatedAt: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      mode: "quick",
      countryCode: "TH",
      platformId: "tiktok-shop",
      rateSource: "auto",
      rateProvider: "erapi",
      manualRate: 5.0,
      autoRate: null,
      autoRateUpdatedAt: null,

      setMode: (mode) => set({ mode }),

      setCountry: (countryCode) => {
        const available = getPlatformsForCountry(countryCode);
        const current = get().platformId;
        const platformId = available.includes(current) ? current : available[0];
        if (platformId) get().setMarket(countryCode, platformId);
      },

      setMarket: (countryCode, platformId) => {
        if (!getPlatformFees(platformId, countryCode)) return false;
        const current = get();
        const countryChanged = countryCode !== current.countryCode;
        if (!countryChanged && platformId === current.platformId) return true;

        const country = getCountry(countryCode);
        const inputStore = useInputStore.getState();
        const { data } = inputStore;
        const defaults = applyCountryDefaults(data, country, platformId);
        inputStore.setData(countryChanged ? defaults : {
          ...defaults,
          price: data.price,
          rate: data.rate,
          vatRate: data.vatRate,
        });
        set(countryChanged ? {
          countryCode,
          platformId,
          manualRate: country.defaultRate,
          autoRate: null,
          autoRateUpdatedAt: null,
        } : { platformId });
        return true;
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
