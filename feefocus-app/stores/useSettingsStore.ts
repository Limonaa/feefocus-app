import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SettingsStore {
  defaultCurrency: string;
  setDefaultCurrency: (currency: string) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      defaultCurrency: "PLN",
      setDefaultCurrency: (currency) => set({ defaultCurrency: currency }),
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
