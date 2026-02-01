export interface Subscription {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'weekly' | 'yearly';
  category: string;
  nextPaymentDate: Date;
}
