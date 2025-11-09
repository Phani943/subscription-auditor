import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Modal as RNModal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useSubscriptionStore} from '@/src/store/subscriptionStore';
import {useRouter} from 'expo-router';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable'; // NEW IMPORT
import Reanimated from 'react-native-reanimated'; // NEW IMPORT
import {Ionicons} from '@expo/vector-icons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {LinearGradient} from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import * as NavigationBar from 'expo-navigation-bar';

NavigationBar.setBackgroundColorAsync("white").then(r => console.log(r));
NavigationBar.setButtonStyleAsync("dark").then(r => console.log(r));

SystemUI.setBackgroundColorAsync('#FFFFFF').then(r => console.log(r));

export default function HomeTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const loadFromStorage = useSubscriptionStore((state) => state.loadFromStorage);
  const deleteSubscription = useSubscriptionStore((state) => state.deleteSubscription);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ visible: boolean; id: string; name: string }>({
    visible: false,
    id: '',
    name: '',
  });

  // Store refs for all swipeable items
  const swipeableRefs = useRef<{ [key: string]: any }>({});

  useEffect(() => {
    loadFromStorage().then(r => console.log("Loaded from storage", r));
    // eslint-disable-next-line
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadFromStorage();
    setTimeout(() => setIsRefreshing(false), 500);
  }, [loadFromStorage]);

  const totalSpend = subscriptions.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  const activeCount = subscriptions.filter(s => s.active).length;

  const categoryColors = {
    streaming: '#FF6B6B',
    software: '#4ECDC4',
    gym: '#95E1D3',
    food: '#FFD93D',
    other: '#A8D8EA',
  };

  const closeSwipeable = (id: string) => {
    if (swipeableRefs.current[id]) {
      swipeableRefs.current[id]?.close();
    }
  };

  const handleDeleteConfirm = async () => {
    const id = deleteModal.id;
    await deleteSubscription(id);
    setDeleteModal({ visible: false, id: '', name: '' });
    closeSwipeable(id);
  };

  const handleDeleteCancel = () => {
    const id = deleteModal.id;
    setDeleteModal({ visible: false, id: '', name: '' });
    closeSwipeable(id);
  };

  const handleSwipeOpen = (id: string, name: string) => {
    setDeleteModal({ visible: true, id, name });
  };

  const renderRightActions = () => (
      <Reanimated.View style={styles.deleteActionContainer}>
        <View style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={22} color="white" />
        </View>
      </Reanimated.View>
  );

  const getDaysUntilRenewal = (renewalDate: string) => {
    const renewal = new Date(renewalDate);
    const today = new Date();
    return Math.ceil((renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getRenewalStatus = (daysLeft: number) => {
    if (daysLeft < 0) return { text: 'Overdue', color: '#FF3B30', icon: 'warning' as const, bg: '#FFE5E5' };
    if (daysLeft === 0) return { text: 'Today', color: '#FF9500', icon: 'alert-circle' as const, bg: '#FFF3E0' };
    if (daysLeft <= 3) return { text: `${daysLeft}d`, color: '#FF9500', icon: 'time-outline' as const, bg: '#FFF3E0' };
    if (daysLeft <= 7) return { text: `${daysLeft}d`, color: '#34C759', icon: 'time-outline' as const, bg: '#E8F5E9' };
    return { text: `${daysLeft}d`, color: '#007AFF', icon: 'time-outline' as const, bg: '#E3F2FD' };
  };

  return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar backgroundColor="#0056D6" translucent={false} style="light" />

        <View style={styles.container}>
            <View style={[styles.headerContent, { backgroundColor: '#0056D6' }]}>
              <View style={styles.headerTop}>
                <Text style={styles.headerTitle}>My Subscriptions</Text>
              </View>

              <View style={styles.spendingCardGlass}>
                <View style={styles.spendingLeft}>
                  <Text style={styles.spendingLabel}>Total Spending</Text>
                  <Text style={styles.spendingAmount}>₹{totalSpend.toFixed(2)}</Text>
                  <View style={styles.spendingStats}>
                    <View style={styles.statItem}>
                      <View style={[styles.statDot, { backgroundColor: '#4CAF50' }]} />
                      <Text style={styles.statText}>{activeCount} Active</Text>
                    </View>
                    <View style={styles.statItem}>
                      <View style={[styles.statDot, { backgroundColor: '#FF9800' }]} />
                      <Text style={styles.statText}>{subscriptions.length - activeCount} Inactive</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.spendingIconGlow}>
                  <LinearGradient
                      colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']}
                      style={styles.iconGlowCircle}
                  >
                    <Ionicons name="wallet" size={36} color="white" />
                  </LinearGradient>
                </View>
              </View>
            </View>


          <ScrollView
              style={styles.list}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                    tintColor="#007AFF"
                    progressBackgroundColor="white"
                />
              }
          >
            {subscriptions.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconContainer}>
                    <LinearGradient
                        colors={['#E3F2FD', '#BBDEFB']}
                        style={styles.emptyIconCircle}
                    >
                      <Ionicons name="apps-outline" size={48} color="#1976D2" />
                    </LinearGradient>
                  </View>
                  <Text style={styles.emptyText}>No subscriptions yet</Text>
                  <Text style={styles.emptySubtext}>
                    Start tracking your subscriptions and take control of your spending
                  </Text>
                  <Pressable
                      style={styles.emptyButton}
                      onPress={() => router.push('/add-subscription')}
                  >
                    <LinearGradient
                        colors={['#007AFF', '#0056D6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.emptyButtonGradient}
                    >
                      <Ionicons name="add-circle" size={22} color="white" />
                      <Text style={styles.emptyButtonText}>Add First Subscription</Text>
                    </LinearGradient>
                  </Pressable>
                </View>
            ) : (
                <View style={styles.listContent}>
                  {subscriptions.map((sub) => {
                    const daysLeft = getDaysUntilRenewal(sub.renewalDate);
                    const renewalStatus = getRenewalStatus(daysLeft);
                    const categoryColor = categoryColors[sub.category as keyof typeof categoryColors];

                    // @ts-ignore
                    return (
                        <Swipeable
                            key={sub.id}
                            //@ts-ignore
                            ref={(ref: any) => (swipeableRefs.current[sub.id] = ref)}
                            renderRightActions={renderRightActions}
                            onSwipeableWillOpen={() => handleSwipeOpen(sub.id, sub.name)}
                            overshootRight={false}
                            friction={2}
                        >
                          <Pressable
                              onPress={() => router.push({
                                pathname: '/edit-subscription',
                                params: { subscriptionId: sub.id },
                              })}
                              style={[
                                styles.card,
                                !sub.active && styles.cardInactive,
                              ]}
                          >
                            <View style={[styles.cardBorderAccent, { backgroundColor: categoryColor }]} />

                            <View style={styles.cardContent}>
                              <View style={styles.cardLeft}>
                                <LinearGradient
                                    colors={[categoryColor + '20', categoryColor + '10']}
                                    style={styles.cardIcon}
                                >
                                  <Ionicons
                                      name={
                                        sub.category === 'streaming' ? 'film' :
                                            sub.category === 'software' ? 'code-slash' :
                                                sub.category === 'gym' ? 'fitness' :
                                                    sub.category === 'food' ? 'fast-food' : 'apps'
                                      }
                                      size={24}
                                      color={categoryColor}
                                  />
                                </LinearGradient>
                                <View style={styles.cardInfo}>
                                  <Text style={styles.cardTitle}>{sub.name}</Text>
                                  <View style={styles.cardMeta}>
                                    <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '15' }]}>
                                      <Text style={[styles.categoryBadgeText, { color: categoryColor }]}>
                                        {sub.category.charAt(0).toUpperCase() + sub.category.slice(1)}
                                      </Text>
                                    </View>
                                    {!sub.active && (
                                        <Text style={styles.inactiveTag}>• Inactive</Text>
                                    )}
                                  </View>
                                </View>
                              </View>

                              <View style={styles.cardRight}>
                                <Text style={styles.cardAmount}>₹{sub.amount}</Text>
                                <View style={[styles.renewalBadge, { backgroundColor: renewalStatus.bg }]}>
                                  <Ionicons name={renewalStatus.icon} size={12} color={renewalStatus.color} />
                                  <Text style={[styles.renewalText, { color: renewalStatus.color }]}>
                                    {renewalStatus.text}
                                  </Text>
                                </View>
                              </View>
                            </View>

                            <View style={styles.cardFooter}>
                              <View style={styles.cardFooterItem}>
                                <Ionicons name="calendar-outline" size={14} color="#999" />
                                <Text style={styles.cardDate}>
                                  Renews {new Date(sub.renewalDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                                </Text>
                              </View>
                              <View style={styles.cardFooterItem}>
                                <Ionicons name="card-outline" size={14} color="#999" />
                                <Text style={styles.cardPayment}>{sub.paymentMethod}</Text>
                              </View>
                            </View>
                          </Pressable>
                        </Swipeable>
                    );
                  })}
                </View>
            )}
          </ScrollView>

          {/* Modern FAB */}
          <Pressable
              style={styles.fab}
              onPress={() => router.push('/add-subscription')}
          >
            <LinearGradient
                colors={['#007AFF', '#0056D6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.fabGradient}
            >
              <View style={styles.customPlusIcon}>
                <View style={styles.plusHorizontal} />
                <View style={styles.plusVertical} />
              </View>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Delete Modal */}
        <RNModal
            visible={deleteModal.visible}
            transparent
            animationType="fade"
            onRequestClose={handleDeleteCancel}
        >
          <Pressable
              style={styles.modalOverlay}
              onPress={handleDeleteCancel}
          >
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalIconContainer}>
                <View style={styles.modalIcon}>
                  <Ionicons name="warning" size={48} color="#FF3B30" />
                </View>
              </View>

              <Text style={styles.modalTitle}>Delete Subscription?</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to delete &#34;{deleteModal.name}&#34;? This action cannot be undone.
              </Text>

              <View style={styles.modalButtons}>
                <Pressable
                    style={styles.modalCancelButton}
                    onPress={handleDeleteCancel}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </Pressable>

                <Pressable
                    style={styles.modalDeleteButton}
                    onPress={handleDeleteConfirm}
                >
                  <LinearGradient
                      colors={['#FF3B30', '#D32F2F']}
                      style={styles.modalDeleteGradient}
                  >
                    <Text style={styles.modalDeleteText}>Delete</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </RNModal>
      </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  headerGradient: {
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },

  headerContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },

  headerTop: {
    marginBottom: 20,
    marginTop: -4,
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 0.5,
  },

  spendingCardGlass: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },

  spendingLeft: {
    flex: 1,
  },

  spendingLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },

  spendingAmount: {
    color: 'white',
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.5,
  },

  spendingStats: {
    flexDirection: 'row',
    gap: 16,
  },

  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  statText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
  },

  spendingIconGlow: {
    marginLeft: 16,
  },

  iconGlowCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },

  list: {
    flex: 1,
    marginTop: -16,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    marginLeft: 4,
    marginRight: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },

  cardBorderAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },

  cardInactive: {
    opacity: 0.6,
  },

  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },

  cardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardInfo: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },

  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  inactiveTag: {
    fontSize: 11,
    color: '#FF3B30',
    fontWeight: '600',
  },

  cardRight: {
    alignItems: 'flex-end',
    gap: 8,
  },

  cardAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
  },

  renewalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
  },

  renewalText: {
    fontSize: 12,
    fontWeight: '700',
  },

  cardFooter: {
    flexDirection: 'row',
    paddingLeft: 20,
    paddingRight: 16,
    paddingBottom: 16,
    gap: 20,
  },

  cardFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  cardDate: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },

  cardPayment: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },

  deleteActionContainer: {
    justifyContent: 'center',
    marginBottom: 16,
    marginLeft: -20,
    marginRight: 4,
  },

  deleteButton: {
    backgroundColor: '#FF3B30',
    width: 76,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    shadowColor: '#FF3B30',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 30,
  },

  emptyIconContainer: {
    marginBottom: 24,
  },

  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 12,
  },

  emptySubtext: {
    fontSize: 15,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },

  emptyButton: {
    borderRadius: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },

  emptyButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  emptyButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },

  // FAB with Custom Thick Plus
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    borderRadius: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },

  fabGradient: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },

  // Custom Thick Plus Icon
  customPlusIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  plusHorizontal: {
    position: 'absolute',
    width: 24,
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },

  plusVertical: {
    position: 'absolute',
    width: 4,
    height: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },

  // Beautiful Custom Delete Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 24,
  },

  modalIconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },

  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
  },

  modalMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },

  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },

  modalCancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },

  modalCancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
  },

  modalDeleteButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },

  modalDeleteGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },

  modalDeleteText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
