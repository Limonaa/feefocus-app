export interface SubscriptionHistory {
  periodStart: Date;
  periodEnd: Date;
  price: number;
  currency: string;
}

export interface Subscription {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: "monthly" | "weekly" | "yearly";
  category: string;
  nextPaymentDate: Date;
  notificationId?: string;
  history?: SubscriptionHistory[];
}
