import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Subscription } from "@/types/subscription";
import { cancelSubscriptionNotification } from "@/services/notificationService";

interface SubscriptionStore {
  subscriptions: Subscription[];
  addSubscription: (subscription: Subscription) => void;
  removeSubscription: (id: string) => void;
  updateSubscription: (id: string, subscription: Partial<Subscription>) => void;
  getSubscriptionById: (id: string) => Subscription | undefined;
  getTotalMonthlySpending: () => number;
  updateExpiredSubscriptions: () => Promise<void>;
  deleteSubscriptions: () => void;
  getSubscriptionHistory: (id: string) => any[];
}

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set, get) => ({
      subscriptions: [],

      addSubscription: (subscription) =>
        set((state) => ({
          subscriptions: [...state.subscriptions, subscription],
        })),

      removeSubscription: (id) => {
        const subscription = get().subscriptions.find((sub) => sub.id === id);
        if (subscription?.notificationId) {
          cancelSubscriptionNotification(subscription.notificationId);
        }
        set((state) => ({
          subscriptions: state.subscriptions.filter((sub) => sub.id !== id),
        }));
      },

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

      updateExpiredSubscriptions: async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const updatedSubscriptions = get().subscriptions.map((sub) => {
          const nextPayment = new Date(sub.nextPaymentDate);
          nextPayment.setHours(0, 0, 0, 0);

          if (nextPayment < today) {
            const oldNextPayment = new Date(sub.nextPaymentDate);
            const newDate = new Date(sub.nextPaymentDate);
            const periodStart = new Date(sub.nextPaymentDate);

            switch (sub.billingCycle) {
              case "weekly":
                periodStart.setDate(periodStart.getDate() - 7);
                newDate.setDate(newDate.getDate() + 7);
                break;
              case "monthly":
                periodStart.setMonth(periodStart.getMonth() - 1);
                newDate.setMonth(newDate.getMonth() + 1);
                break;
              case "yearly":
                periodStart.setFullYear(periodStart.getFullYear() - 1);
                newDate.setFullYear(newDate.getFullYear() + 1);
                break;
            }

            const historyEntry = {
              periodStart: periodStart,
              periodEnd: oldNextPayment,
              price: sub.price,
              currency: sub.currency,
            };

            const updatedHistory = [...(sub.history || []), historyEntry];

            return {
              ...sub,
              nextPaymentDate: newDate,
              history: updatedHistory,
              needsNotificationUpdate: true,
            };
          }

          return sub;
        });

        set({ subscriptions: updatedSubscriptions });

        updatedSubscriptions.forEach(async (sub) => {
          if ((sub as any).needsNotificationUpdate) {
            if (sub.notificationId) {
              await cancelSubscriptionNotification(sub.notificationId);
            }
          }
        });
      },

      getSubscriptionHistory: (id) => {
        const subscription = get().subscriptions.find((sub) => sub.id === id);
        return subscription?.history || [];
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
