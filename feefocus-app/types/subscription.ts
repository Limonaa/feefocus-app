export interface Subscription {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'weekly' | 'quarterly' | "daily";
  category: string;
  nextPaymentDate: Date;
}
