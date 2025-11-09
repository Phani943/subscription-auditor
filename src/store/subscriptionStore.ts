import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from '../services/notificationService';
import { Subscription } from '../types';

interface SubscriptionStore {
  subscriptions: Subscription[];
  addSubscription: (sub: Subscription) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  updateSubscription: (id: string, sub: Partial<Subscription>) => Promise<void>;
  getSubscriptions: () => Subscription[];
  getTotalMonthlySpend: () => number;
  getTotalSpending: () => number; // NEW: Sum of all subscription amounts
  getCategoryStats: () => any[];
  loadFromStorage: () => Promise<void>;
}

const STORAGE_KEY = 'subscriptions';

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  subscriptions: [],

  addSubscription: async (sub) => {
    const updated = [...get().subscriptions, sub];
    set({ subscriptions: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    await notificationService.scheduleRenewalNotification(sub);
  },

  deleteSubscription: async (id) => {
    const updated = get().subscriptions.filter((s) => s.id !== id);
    set({ subscriptions: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    await notificationService.cancelNotification(id);
  },

  updateSubscription: async (id, updates) => {
    const updated = get().subscriptions.map((s) =>
      s.id === id ? { ...s, ...updates } : s
    );
    set({ subscriptions: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    const updatedSub = updated.find((s) => s.id === id);
    if (updatedSub) {
      await notificationService.cancelNotification(id);
      if (updatedSub.active) {
        await notificationService.scheduleRenewalNotification(updatedSub);
      }
    }
  },

  getSubscriptions: () => get().subscriptions,

  getTotalMonthlySpend: () => {
    return get().subscriptions.reduce((sum, s) => sum + (s.active ? s.amount : 0), 0);
  },

  getTotalSpending: () => {
    const total = get().subscriptions.reduce((sum, s) => {
      const amount = Number(s.amount);
      console.log(`Subscription: ${s.name}, Amount: ${amount}`); // Debug log
      return sum + amount;
    }, 0);
    console.log(`Total Spending: ${total}`); // Debug log
    return total;
  },

  getCategoryStats: () => {
    const subs = get().subscriptions;
    const stats: any = {};
    subs.forEach((s) => {
      if (!stats[s.category]) {
        stats[s.category] = { total: 0, count: 0 };
      }
      if (s.active) {
        stats[s.category].total += s.amount;
        stats[s.category].count += 1;
      }
    });
    return Object.entries(stats).map(([category, data]: any) => ({
      category,
      ...data,
    }));
  },

  loadFromStorage: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const subs = JSON.parse(data);
        set({ subscriptions: subs });
        await notificationService.scheduleAllNotifications(subs);
      }
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    }
  },
}));
