/* eslint-disable react-hooks/exhaustive-deps */
import { StyleSheet, View, Text, TextInput, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform, Modal, Animated } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSubscriptionStore } from '@/src/store/subscriptionStore';
import { Subscription } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function EditSubscriptionScreen(){
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { subscriptionId } = useLocalSearchParams();
  const { subscriptions, updateSubscription } = useSubscriptionStore();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<'streaming' | 'software' | 'gym' | 'food' | 'other'>('streaming');
  const [renewalDate, setRenewalDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [showPaymentPicker, setShowPaymentPicker] = useState(false);
  const [active, setActive] = useState(true);

  // Toast animation
  const toastAnim = useRef(new Animated.Value(-100)).current;
  const [showToast, setShowToast] = useState(false);

  const categories = [
    { id: 'streaming', icon: 'film', label: 'Streaming', color: '#FF6B6B' },
    { id: 'software', icon: 'code-slash', label: 'Software', color: '#4ECDC4' },
    { id: 'gym', icon: 'fitness', label: 'Gym', color: '#95E1D3' },
    { id: 'food', icon: 'fast-food', label: 'Food', color: '#FFD93D' },
    { id: 'other', icon: 'apps', label: 'Other', color: '#A8D8EA' },
  ] as const;

  const paymentMethods = [
    { id: 'UPI', label: 'UPI', icon: 'phone-portrait' },
    { id: 'Debit Card', label: 'Debit Card', icon: 'card' },
    { id: 'Credit Card', label: 'Credit Card', icon: 'card-outline' },
    { id: 'Others', label: 'Others', icon: 'ellipsis-horizontal' },
  ];

  useEffect(() => {
    const sub = subscriptions.find((s) => s.id === subscriptionId);
    if (sub) {
      setSubscription(sub);
      setName(sub.name);
      setAmount(sub.amount.toString());
      setCategory(sub.category);
      setRenewalDate(new Date(sub.renewalDate));
      setPaymentMethod(sub.paymentMethod);
      setActive(sub.active);
    }
  }, [subscriptionId]);

  const showSuccessToast = () => {
    setShowToast(true);
    Animated.spring(toastAnim, {
      toValue: insets.top + 10,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();

    // Navigate back immediately after showing toast
    setTimeout(() => {
      router.back();
    }, 1500);
  };

  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setRenewalDate(selectedDate);
    }
  };

  const handleUpdate = async () => {
    if (!name || !amount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await updateSubscription(subscriptionId as string, {
        name,
        amount: parseFloat(amount),
        category,
        renewalDate: renewalDate.toISOString().split('T')[0],
        paymentMethod,
        active,
      });
      showSuccessToast();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      Alert.alert('Error', 'Failed to update subscription');
    }
  };

  if (!subscription) {
    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </View>
    );
  }

  return (
      <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <StatusBar style="dark" />
        <View style={[styles.container, { paddingTop: insets.top }]}>
          {/* Custom Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
            </Pressable>
            <Text style={styles.headerTitle}>Edit Subscription</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
          >
            {/* Name Field */}
            <View style={styles.field}>
              <Text style={styles.label}>
                Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                  style={styles.input}
                  placeholder="e.g., Netflix"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={setName}
              />
            </View>

            {/* Amount Field */}
            <View style={styles.field}>
              <Text style={styles.label}>
                Amount (₹) <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                  style={styles.input}
                  placeholder="e.g., 499"
                  placeholderTextColor="#999"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
              />
            </View>

            {/* Category Field */}
            <View style={styles.field}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryGrid}>
                {categories.map((cat) => (
                    <Pressable
                        key={cat.id}
                        style={[
                          styles.categoryCard,
                          { backgroundColor: category === cat.id ? cat.color + '20' : '#F8F9FB' },
                          category === cat.id && { borderColor: cat.color, borderWidth: 2 },
                        ]}
                        onPress={() => setCategory(cat.id as any)}
                    >
                      <View style={[styles.iconCircle, { backgroundColor: cat.color }]}>
                        <Ionicons name={cat.icon as any} size={16} color="#FFF" />
                      </View>
                      <Text style={[styles.categoryLabel, category === cat.id && { color: cat.color, fontWeight: '700' }]}>
                        {cat.label}
                      </Text>
                    </Pressable>
                ))}
              </View>
            </View>

            {/* Renewal Date */}
            <View style={styles.field}>
              <Text style={styles.label}>
                Renewal Date <Text style={styles.required}>*</Text>
              </Text>
              <Pressable style={styles.selectButton} onPress={() => setShowDatePicker(true)}>
                <View style={styles.selectLeft}>
                  <Ionicons name="calendar-outline" size={20} color="#007AFF" />
                  <Text style={styles.selectText}>
                    {renewalDate.toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </Pressable>
              {showDatePicker && (
                  <DateTimePicker
                      value={renewalDate}
                      mode="date"
                      display="default"
                      onChange={handleDateChange}
                      minimumDate={new Date()}
                  />
              )}
            </View>

            {/* Payment Method */}
            <View style={styles.field}>
              <Text style={styles.label}>Payment Method</Text>
              <Pressable style={styles.selectButton} onPress={() => setShowPaymentPicker(true)}>
                <View style={styles.selectLeft}>
                  <Ionicons
                      name={paymentMethods.find(p => p.id === paymentMethod)?.icon as any || 'card'}
                      size={20}
                      color="#007AFF"
                  />
                  <Text style={styles.selectText}>{paymentMethod}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </Pressable>
            </View>

            {/* Active Status */}
            <View style={styles.field}>
              <Text style={styles.label}>Active Status</Text>
              <Pressable
                  style={styles.toggleContainer}
                  onPress={() => setActive(!active)}
              >
                <View style={styles.toggleContent}>
                  <View style={styles.toggleTextContainer}>
                    <Text style={styles.toggleTitle}>
                      {active ? 'Active' : 'Paused'}
                    </Text>
                    <Text style={styles.toggleSubtext}>
                      {active ? 'Subscription is active' : 'Subscription is paused'}
                    </Text>
                  </View>
                  <View style={[
                    styles.modernToggle,
                    { backgroundColor: active ? '#34C759' : '#E5E5E5' }
                  ]}>
                    <View style={[
                      styles.modernToggleThumb,
                      { left: active ? 22 : 2 }
                    ]} />
                  </View>
                </View>
              </Pressable>
            </View>
          </ScrollView>

          {/* Update Button */}
          <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 20 }]}>
            <Pressable
                style={({ pressed }) => [styles.updateButton, pressed && styles.updateButtonPressed]}
                onPress={handleUpdate}
            >
              <Ionicons name="checkmark-circle" size={22} color="white" />
              <Text style={styles.updateButtonText}>Update Subscription</Text>
            </Pressable>
          </View>

          {/* Payment Method Modal */}
          <Modal visible={showPaymentPicker} transparent animationType="slide">
            <Pressable style={styles.modalOverlay} onPress={() => setShowPaymentPicker(false)}>
              <View style={styles.modalContent}>
                <View style={styles.modalHandle} />
                <Text style={styles.modalTitle}>Select Payment Method</Text>
                {paymentMethods.map((method) => (
                    <Pressable
                        key={method.id}
                        style={styles.modalOption}
                        onPress={() => {
                          setPaymentMethod(method.id);
                          setShowPaymentPicker(false);
                        }}
                    >
                      <Ionicons name={method.icon as any} size={24} color="#007AFF" />
                      <Text style={styles.modalOptionText}>{method.label}</Text>
                      {paymentMethod === method.id && (
                          <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
                      )}
                    </Pressable>
                ))}
              </View>
            </Pressable>
          </Modal>

          {/* Success Toast */}
          {showToast && (
              <Animated.View
                  style={[
                    styles.toast,
                    {
                      transform: [{ translateY: toastAnim }],
                    },
                  ]}
              >
                <View style={styles.toastContent}>
                  <View style={styles.toastIconCircle}>
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  </View>
                  <View style={styles.toastTextContainer}>
                    <Text style={styles.toastTitle}>Updated!</Text>
                    <Text style={styles.toastMessage}>Subscription updated successfully</Text>
                  </View>
                </View>
              </Animated.View>
          )}
        </View>
      </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 16,
    color: '#666',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  placeholder: {
    width: 40,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },

  field: {
    marginBottom: 12,
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },

  required: {
    color: '#FF3B30',
  },

  input: {
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#F8F9FB',
    color: '#1A1A1A',
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  categoryCard: {
    width: '31.5%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },

  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    flex: 1,
  },

  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FB',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 14,
  },

  selectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  selectText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },

  toggleContainer: {
    backgroundColor: '#F8F9FB',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 14,
  },

  toggleContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  toggleTextContainer: {
    flex: 1,
  },

  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },

  toggleSubtext: {
    fontSize: 12,
    color: '#999',
  },

  modernToggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },

  modernToggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    position: 'absolute',
  },

  buttonContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },

  updateButton: {
    backgroundColor: '#007AFF',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },

  updateButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },

  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },

  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },

  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderRadius: 12,
    backgroundColor: '#F8F9FB',
    marginBottom: 8,
  },

  modalOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
  },

  // Toast Notification
  toast: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 9999,
  },

  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },

  toastIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  toastTextContainer: {
    flex: 1,
  },

  toastTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },

  toastMessage: {
    fontSize: 14,
    color: '#666',
  },
});
