import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Subscription } from "@/types/subscription";

interface SubscriptionStore {
  subscriptions: Subscription[];
  addSubscription: (subscription: Subscription) => void;
  removeSubscription: (id: string) => void;
  updateSubscription: (id: string, subscription: Partial<Subscription>) => void;
  getSubscriptionById: (id: string) => Subscription | undefined;
  getTotalMonthlySpending: () => number;
  updateExpiredSubscriptions: () => void;
  deleteSubscriptions: () => void;
}

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set, get) => ({
      subscriptions: [],

      addSubscription: (subscription) =>
        set((state) => ({
          subscriptions: [...state.subscriptions, subscription],
        })),

      removeSubscription: (id) =>
        set((state) => ({
          subscriptions: state.subscriptions.filter((sub) => sub.id !== id),
        })),

      updateSubscription: (id, updatedSubscription) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) =>
            sub.id === id ? { ...sub, ...updatedSubscription } : sub,
          ),
        })),

      getSubscriptionById: (id) => {
        return get().subscriptions.find((sub) => sub.id === id);
      },

      getTotalMonthlySpending: () => {
        const subscriptions = get().subscriptions;
        return subscriptions.reduce((total, sub) => {
          let monthlyPrice = sub.price;

          switch (sub.billingCycle) {
            case "weekly":
              monthlyPrice = sub.price * 4;
              break;
            case "monthly":
              monthlyPrice = sub.price;
              break;
            case "yearly":
              monthlyPrice = sub.price / 12;
              break;
          }

          return total + monthlyPrice;
        }, 0);
      },

      updateExpiredSubscriptions: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        set((state) => ({
          subscriptions: state.subscriptions.map((sub) => {
            const nextPayment = new Date(sub.nextPaymentDate);
            nextPayment.setHours(0, 0, 0, 0);

            if (nextPayment < today) {
              const newDate = new Date(sub.nextPaymentDate);

              switch (sub.billingCycle) {
                case "weekly":
                  newDate.setDate(newDate.getDate() + 7);
                  break;
                case "monthly":
                  newDate.setMonth(newDate.getMonth() + 1);
                  break;
                case "yearly":
                  newDate.setFullYear(newDate.getFullYear() + 1);
                  break;
              }

              return { ...sub, nextPaymentDate: newDate };
            }

            return sub;
          }),
        }));
      },

      deleteSubscriptions: () => {
        set({ subscriptions: [] });
      },
    }),
    {
      name: "subscription-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
