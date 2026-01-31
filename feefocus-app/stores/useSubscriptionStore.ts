import { create } from 'zustand';
import { Subscription } from '@/types/subscription';

interface SubscriptionStore {
  subscriptions: Subscription[];
  addSubscription: (subscription: Subscription) => void;
  removeSubscription: (id: string) => void;
  updateSubscription: (id: string, subscription: Partial<Subscription>) => void;
  getSubscriptionById: (id: string) => Subscription | undefined;
  getTotalMonthlySpending: () => number;
}

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
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
        sub.id === id ? { ...sub, ...updatedSubscription } : sub
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
        case 'daily':
          monthlyPrice = sub.price * 30;
          break;
        case 'weekly':
          monthlyPrice = sub.price * 4;
          break;
        case 'monthly':
          monthlyPrice = sub.price;
          break;
        case 'quarterly':
          monthlyPrice = sub.price / 3;
          break;
        case 'yearly':
          monthlyPrice = sub.price / 12;
          break;
      }
      
      return total + monthlyPrice;
    }, 0);
  },
}));
