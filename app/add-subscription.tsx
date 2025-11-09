import { StyleSheet, View, Text, TextInput, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform, Modal, Animated } from 'react-native';
import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useSubscriptionStore } from '@/src/store/subscriptionStore';
import { Subscription } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function AddSubscriptionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addSubscription } = useSubscriptionStore();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<'streaming' | 'software' | 'gym' | 'food' | 'other'>('streaming');
  const [renewalDate, setRenewalDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [showPaymentPicker, setShowPaymentPicker] = useState(false);

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

  const handleAdd = async () => {
    if (!name || !amount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const subscription: Subscription = {
      id: Date.now().toString(),
      name,
      amount: parseFloat(amount),
      currency: '₹',
      renewalDate: renewalDate.toISOString().split('T')[0],
      category,
      paymentMethod,
      active: true,
      createdAt: new Date().toISOString(),
    };

    try {
      await addSubscription(subscription);
      showSuccessToast();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      Alert.alert('Error', 'Failed to add subscription');
    }
  };

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
            <Text style={styles.headerTitle}>Add Subscription</Text>
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
          </ScrollView>

          {/* Add Button */}
          <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 20 }]}>
            <Pressable
                style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
                onPress={handleAdd}
            >
              <Text style={styles.addButtonText}>Add Subscription</Text>
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
                    <Text style={styles.toastTitle}>Success!</Text>
                    <Text style={styles.toastMessage}>Subscription added successfully</Text>
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
    marginBottom: 14,
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
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },

  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  categoryLabel: {
    fontSize: 13,
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

  buttonContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },

  addButton: {
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

  addButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },

  addButtonText: {
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

  // Beautiful Toast Notification
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
