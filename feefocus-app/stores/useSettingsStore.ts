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
  upcomingPaymentsNotif: boolean;
  monthlySummaryNotif: boolean;
  monthlyNotificationId?: string;
  setDefaultCurrency: (currency: string) => void;
  updateExchangeRates: () => Promise<boolean>;
  setExchangeRates: (rates: ExchangeRates) => void;
  setUpcomingPaymentsNotif: (enabled: boolean) => void;
  setMonthlySummaryNotif: (enabled: boolean) => void;
  setMonthlyNotificationId: (id?: string) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      defaultCurrency: "PLN",
      exchangeRates: DEFAULT_EXCHANGE_RATES,
      isLoadingRates: false,
      upcomingPaymentsNotif: true,
      monthlySummaryNotif: true,
      monthlyNotificationId: undefined,

      setDefaultCurrency: (currency) => set({ defaultCurrency: currency }),

      setExchangeRates: (rates) => set({ exchangeRates: rates }),

      setUpcomingPaymentsNotif: (enabled) =>
        set({ upcomingPaymentsNotif: enabled }),

      setMonthlySummaryNotif: (enabled) =>
        set({ monthlySummaryNotif: enabled }),

      setMonthlyNotificationId: (id) => set({ monthlyNotificationId: id }),

      updateExchangeRates: async () => {
        const today = new Date().toISOString().split("T")[0];
        const currentRates = get().exchangeRates;

        if (currentRates.lastUpdated === today) {
          return true;
        }

        set({ isLoadingRates: true });

        try {
          const rates = await fetchExchangeRates();
          set({ exchangeRates: rates, isLoadingRates: false });
          return true;
        } catch (error) {
          console.error("Failed to fetch currency rates, using default rates");
          set({ isLoadingRates: false });
          return false;
        }
      },
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
