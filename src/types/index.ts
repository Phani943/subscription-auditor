export interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: string;
  renewalDate: string;
  category: 'streaming' | 'software' | 'gym' | 'food' | 'other';
  description?: string;
  paymentMethod: string;
  active: boolean;
  createdAt: string;
  receipts?: string[];
  notes?: string;
}

export interface CategoryStats {
  category: string;
  totalAmount: number;
  count: number;
}
