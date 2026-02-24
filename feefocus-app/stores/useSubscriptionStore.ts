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
  addSampleDataWithHistory: () => void;
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

      addSampleDataWithHistory: () => {
        const now = new Date();
        const sampleSubscriptions: Subscription[] = [
          {
            id: "sample-1",
            name: "Netflix",
            price: 49.99,
            currency: "PLN",
            billingCycle: "monthly",
            category: "Rozrywka",
            nextPaymentDate: new Date(2026, 2, 15), // March 15, 2026
            history: [
              {
                periodStart: new Date(2025, 10, 15), // Nov 15, 2025
                periodEnd: new Date(2025, 11, 15), // Dec 15, 2025
                price: 49.99,
                currency: "PLN",
              },
              {
                periodStart: new Date(2025, 11, 15), // Dec 15, 2025
                periodEnd: new Date(2026, 0, 15), // Jan 15, 2026
                price: 49.99,
                currency: "PLN",
              },
              {
                periodStart: new Date(2026, 0, 15), // Jan 15, 2026
                periodEnd: new Date(2026, 1, 15), // Feb 15, 2026
                price: 49.99,
                currency: "PLN",
              },
            ],
          },
          {
            id: "sample-2",
            name: "Spotify Premium",
            price: 21.99,
            currency: "PLN",
            billingCycle: "monthly",
            category: "Muzyka",
            nextPaymentDate: new Date(2026, 2, 20), // March 20, 2026
            history: [
              {
                periodStart: new Date(2025, 11, 20), // Dec 20, 2025
                periodEnd: new Date(2026, 0, 20), // Jan 20, 2026
                price: 21.99,
                currency: "PLN",
              },
              {
                periodStart: new Date(2026, 0, 20), // Jan 20, 2026
                periodEnd: new Date(2026, 1, 20), // Feb 20, 2026
                price: 21.99,
                currency: "PLN",
              },
            ],
          },
          {
            id: "sample-3",
            name: "Adobe Creative Cloud",
            price: 299.99,
            currency: "PLN",
            billingCycle: "yearly",
            category: "Narzędzia",
            nextPaymentDate: new Date(2027, 1, 1), // Feb 1, 2027
            history: [
              {
                periodStart: new Date(2025, 1, 1), // Feb 1, 2025
                periodEnd: new Date(2026, 1, 1), // Feb 1, 2026
                price: 299.99,
                currency: "PLN",
              },
            ],
          },
          {
            id: "sample-4",
            name: "ChatGPT Plus",
            price: 20,
            currency: "USD",
            billingCycle: "monthly",
            category: "Produktywność",
            nextPaymentDate: new Date(2026, 2, 10), // March 10, 2026
            history: [
              {
                periodStart: new Date(2025, 9, 10), // Oct 10, 2025
                periodEnd: new Date(2025, 10, 10), // Nov 10, 2025
                price: 20,
                currency: "USD",
              },
              {
                periodStart: new Date(2025, 10, 10), // Nov 10, 2025
                periodEnd: new Date(2025, 11, 10), // Dec 10, 2025
                price: 20,
                currency: "USD",
              },
              {
                periodStart: new Date(2025, 11, 10), // Dec 10, 2025
                periodEnd: new Date(2026, 0, 10), // Jan 10, 2026
                price: 20,
                currency: "USD",
              },
              {
                periodStart: new Date(2026, 0, 10), // Jan 10, 2026
                periodEnd: new Date(2026, 1, 10), // Feb 10, 2026
                price: 20,
                currency: "USD",
              },
            ],
          },
        ];

        set({ subscriptions: sampleSubscriptions });
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
