import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ExchangeRates,
  DEFAULT_EXCHANGE_RATES,
  fetchExchangeRates,
} from "@/services/exchangeRateService";

interface SettingsStore {
  defaultCurrency: string;
  exchangeRates: ExchangeRates;
  isLoadingRates: boolean;
  setDefaultCurrency: (currency: string) => void;
  updateExchangeRates: () => Promise<void>;
  setExchangeRates: (rates: ExchangeRates) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      defaultCurrency: "PLN",
      exchangeRates: DEFAULT_EXCHANGE_RATES,
      isLoadingRates: false,
      
      setDefaultCurrency: (currency) => set({ defaultCurrency: currency }),
      
      setExchangeRates: (rates) => set({ exchangeRates: rates }),
      
      updateExchangeRates: async () => {
        const today = new Date().toISOString().split('T')[0];
        const currentRates = get().exchangeRates;
        
        if (currentRates.lastUpdated === today) {
          console.log('currency rates updated');
          return;
        }

        set({ isLoadingRates: true });
        
        try {
          const rates = await fetchExchangeRates();
          set({ exchangeRates: rates, isLoadingRates: false });
          console.log('currency rates updated:', rates);
        } catch (error) {
          console.error('Failed to fetch currency rates, using default rates');
          set({ isLoadingRates: false });
        }
      },
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
