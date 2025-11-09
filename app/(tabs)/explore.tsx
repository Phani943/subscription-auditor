import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useEffect } from 'react';
import { useSubscriptionStore } from '@/src/store/subscriptionStore';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function AnalyticsTab() {
  const insets = useSafeAreaInsets();
  const { subscriptions, loadFromStorage, getTotalMonthlySpend } = useSubscriptionStore();

  useEffect(() => {
    loadFromStorage().then(r => console.log("Loaded from storage", r));
    // eslint-disable-next-line
  }, []);

  const totalSpend = getTotalMonthlySpend();
  const activeCount = subscriptions.filter(s => s.active).length;

  // Category breakdown with colors
  const categoryData = [
    { id: 'streaming', label: 'Streaming', icon: 'film', color: '#FF6B6B' },
    { id: 'software', label: 'Software', icon: 'code-slash', color: '#4ECDC4' },
    { id: 'gym', label: 'Gym', icon: 'fitness', color: '#95E1D3' },
    { id: 'food', label: 'Food', icon: 'fast-food', color: '#FFD93D' },
    { id: 'other', label: 'Other', icon: 'apps', color: '#A8D8EA' },
  ];

  const getCategoryStats = () => {
    return categoryData.map(cat => {
      const categorySubs = subscriptions.filter(s => s.category === cat.id && s.active);
      const total = categorySubs.reduce((sum, s) => sum + s.amount, 0);
      const percentage = totalSpend > 0 ? (total / totalSpend) * 100 : 0;
      return {
        ...cat,
        total,
        count: categorySubs.length,
        percentage,
      };
    }).filter(cat => cat.count > 0)
        .sort((a, b) => b.total - a.total);
  };

  // Upcoming renewals (next 30 days)
  const getUpcomingRenewals = () => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return subscriptions
        .filter(s => {
          const renewalDate = new Date(s.renewalDate);
          return s.active && renewalDate >= now && renewalDate <= thirtyDaysFromNow;
        })
        .sort((a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime())
        .slice(0, 5);
  };

  const categoryStats = getCategoryStats();
  const upcomingRenewals = getUpcomingRenewals();

  const getDaysUntilRenewal = (renewalDate: string) => {
    const renewal = new Date(renewalDate);
    const today = new Date();
    return Math.ceil((renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
      <>
        <StatusBar style="dark" />
        <View style={[styles.container, { paddingTop: insets.top }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Analytics</Text>
          </View>

          <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
          >
            {/* Summary Cards */}
            <View style={styles.summaryCards}>
              <View style={[styles.summaryCard, { backgroundColor: '#E8F5E9' }]}>
                <View style={[styles.iconCircle, { backgroundColor: '#4CAF50' }]}>
                  <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                </View>
                <Text style={styles.cardLabel}>Active</Text>
                <Text style={[styles.cardValue, { color: '#4CAF50' }]}>{activeCount}</Text>
                <Text style={styles.cardSubtext}>Subscriptions</Text>
              </View>

              <View style={[styles.summaryCard, { backgroundColor: '#E3F2FD' }]}>
                <View style={[styles.iconCircle, { backgroundColor: '#2196F3' }]}>
                  <Ionicons name="wallet" size={24} color="#FFF" />
                </View>
                <Text style={styles.cardLabel}>Total</Text>
                <Text style={[styles.cardValue, { color: '#2196F3' }]}>₹{totalSpend.toFixed(0)}</Text>
                <Text style={styles.cardSubtext}>Spending&#39;s</Text>
              </View>
            </View>

            {/* Category Breakdown */}
            {categoryStats.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Spending by Category</Text>
                  <View style={styles.categoryContainer}>
                    {categoryStats.map((cat) => (
                        <View key={cat.id} style={styles.categoryItem}>
                          <View style={styles.categoryHeader}>
                            <View style={styles.categoryLeft}>
                              <View style={[styles.categoryIconCircle, { backgroundColor: cat.color }]}>
                                <Ionicons name={cat.icon as any} size={18} color="#FFF" />
                              </View>
                              <View>
                                <Text style={styles.categoryName}>{cat.label}</Text>
                                <Text style={styles.categoryCount}>{cat.count} subscription{cat.count > 1 ? 's' : ''}</Text>
                              </View>
                            </View>
                            <Text style={styles.categoryAmount}>₹{cat.total.toFixed(0)}</Text>
                          </View>

                          {/* Progress Bar */}
                          <View style={styles.progressBarContainer}>
                            <View
                                style={[
                                  styles.progressBar,
                                  {
                                    width: `${cat.percentage}%`,
                                    backgroundColor: cat.color
                                  }
                                ]}
                            />
                          </View>
                          <Text style={styles.categoryPercentage}>{cat.percentage.toFixed(1)}% of total</Text>
                        </View>
                    ))}
                  </View>
                </View>
            )}

            {/* Upcoming Renewals */}
            {upcomingRenewals.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Upcoming Renewals</Text>
                  <View style={styles.renewalsContainer}>
                    {upcomingRenewals.map((sub) => {
                      const daysLeft = getDaysUntilRenewal(sub.renewalDate);
                      const isUrgent = daysLeft <= 3;

                      return (
                          <View key={sub.id} style={styles.renewalItem}>
                            <View style={styles.renewalLeft}>
                              <View style={[
                                styles.renewalIconCircle,
                                { backgroundColor: isUrgent ? '#FFF3E0' : '#E8F5E9' }
                              ]}>
                                <Ionicons
                                    name="calendar"
                                    size={20}
                                    color={isUrgent ? '#FF9800' : '#4CAF50'}
                                />
                              </View>
                              <View>
                                <Text style={styles.renewalName}>{sub.name}</Text>
                                <Text style={styles.renewalDate}>
                                  {new Date(sub.renewalDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </Text>
                              </View>
                            </View>
                            <View style={styles.renewalRight}>
                              <Text style={styles.renewalAmount}>₹{sub.amount}</Text>
                              <View style={[
                                styles.renewalBadge,
                                { backgroundColor: isUrgent ? '#FFF3E0' : '#E8F5E9' }
                              ]}>
                                <Text style={[
                                  styles.renewalBadgeText,
                                  { color: isUrgent ? '#FF9800' : '#4CAF50' }
                                ]}>
                                  {daysLeft}d
                                </Text>
                              </View>
                            </View>
                          </View>
                      );
                    })}
                  </View>
                </View>
            )}

            {/* Empty State */}
            {subscriptions.length === 0 && (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconContainer}>
                    <Ionicons name="bar-chart-outline" size={64} color="#E0E0E0" />
                  </View>
                  <Text style={styles.emptyText}>No Data Yet</Text>
                  <Text style={styles.emptySubtext}>
                    Add subscriptions to see your analytics and insights
                  </Text>
                </View>
            )}
          </ScrollView>
        </View>
      </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },

  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#F8F9FB',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 0,
  },

  // Summary Cards
  summaryCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },

  summaryCard: {
    flex: 1,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },

  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  cardLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },

  cardValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 2,
  },

  cardSubtext: {
    fontSize: 12,
    color: '#999',
  },

  // Section
  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },

  // Category Breakdown
  categoryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  categoryItem: {
    marginBottom: 20,
  },

  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  categoryIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  categoryCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },

  categoryAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  progressBarContainer: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    marginTop: 8,
    marginBottom: 6,
    overflow: 'hidden',
  },

  progressBar: {
    height: '100%',
    borderRadius: 3,
  },

  categoryPercentage: {
    fontSize: 12,
    color: '#999',
  },

  // Upcoming Renewals
  renewalsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  renewalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },

  renewalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },

  renewalIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  renewalName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  renewalDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },

  renewalRight: {
    alignItems: 'flex-end',
    gap: 4,
  },

  renewalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  renewalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },

  renewalBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },

  emptyIconContainer: {
    marginBottom: 16,
  },

  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },

  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
