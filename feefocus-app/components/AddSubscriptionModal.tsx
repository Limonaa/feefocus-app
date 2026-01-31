import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import { Subscription } from '@/types/subscription';

const subscriptionSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  price: z.string().refine((val) => {
    const normalized = val.replace(',', '.');
    return !isNaN(Number(normalized)) && Number(normalized) > 0;
  }, {
    message: 'Price must be a positive number',
  }),
  currency: z.string().min(1, 'Currency is required'),
  billingCycle: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
  category: z.string().optional(),
});

type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

interface AddSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddSubscriptionModal({
  visible,
  onClose,
}: AddSubscriptionModalProps) {
  const addSubscription = useSubscriptionStore((state) => state.addSubscription);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      name: '',
      price: '',
      currency: 'USD',
      billingCycle: 'monthly',
      category: '',
    },
  });

  const onSubmit = (data: SubscriptionFormData) => {
    const normalizedPrice = data.price.replace(',', '.');
    const newSubscription: Subscription = {
      id: Date.now().toString(),
      name: data.name,
      price: Number(normalizedPrice),
      currency: data.currency,
      billingCycle: data.billingCycle,
      category: data.category || 'Other',
      nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };

    addSubscription(newSubscription);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const billingCycles: Array<{
    label: string;
    value: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  }> = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Quarterly', value: 'quarterly' },
    { label: 'Yearly', value: 'yearly' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={handleClose}
        >
          <Pressable className="bg-white" onPress={(e) => e.stopPropagation()}>
            <ScrollView className="max-h-[90vh]">
              <View className="p-6">
                <View className="flex-row justify-between items-center mb-6">
                  <Text className="text-2xl font-bold text-gray-900">
                    Add Subscription
                  </Text>
                  <TouchableOpacity
                    onPress={handleClose}
                    className="w-8 h-8 items-center justify-center rounded-full bg-gray-100"
                  >
                    <Text className="text-gray-600 text-xl">×</Text>
                  </TouchableOpacity>
                </View>

                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Name
                  </Text>
                  <Controller
                    control={control}
                    name="name"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900"
                        placeholder="e.g., Netflix"
                        placeholderTextColor="#A0A0A0"
                        value={value}
                        onChangeText={onChange}
                        textAlignVertical="center"
                      />
                    )}
                  />
                  {errors.name && (
                    <Text className="text-red-500 text-sm mt-1">
                      {errors.name.message}
                    </Text>
                  )}
                </View>

                {/* Price Input */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Price
                  </Text>
                  <Controller
                    control={control}
                    name="price"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900"
                        placeholder="15.99"
                        placeholderTextColor={"#A0A0A0"}
                        value={value}
                        onChangeText={onChange}
                        keyboardType="decimal-pad"
                        textAlignVertical="center"
                      />
                    )}
                  />
                  {errors.price && (
                    <Text className="text-red-500 text-sm mt-1">
                      {errors.price.message}
                    </Text>
                  )}
                </View>

                {/* Currency Input */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </Text>
                  <Controller
                    control={control}
                    name="currency"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900"
                        placeholder="USD"
                        placeholderTextColor="#A0A0A0"
                        value={value}
                        onChangeText={onChange}
                        textAlignVertical="center"
                      />
                    )}
                  />
                  {errors.currency && (
                    <Text className="text-red-500 text-sm mt-1">
                      {errors.currency.message}
                    </Text>
                  )}
                </View>

                {/* Category Input */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Category <Text className="text-gray-400">(optional)</Text>
                  </Text>
                  <Controller
                    control={control}
                    name="category"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900"
                        placeholder="e.g., Entertainment"
                        placeholderTextColor="#A0A0A0"
                        value={value}
                        onChangeText={onChange}
                        textAlignVertical="center"
                      />
                    )}
                  />
                  {errors.category && (
                    <Text className="text-red-500 text-sm mt-1">
                      {errors.category.message}
                    </Text>
                  )}
                </View>

                {/* Billing Cycle */}
                <View className="mb-6">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Billing Cycle
                  </Text>
                  <Controller
                    control={control}
                    name="billingCycle"
                    render={({ field: { onChange, value } }) => (
                      <View className="flex-row flex-wrap gap-2">
                        {billingCycles.map((cycle) => (
                          <TouchableOpacity
                            key={cycle.value}
                            onPress={() => onChange(cycle.value)}
                            className={`px-4 py-2 rounded-xl border ${
                              value === cycle.value
                                ? 'bg-blue-600 border-blue-600'
                                : 'bg-white border-gray-300'
                            }`}
                          >
                            <Text
                              className={`text-sm font-medium ${
                                value === cycle.value
                                  ? 'text-white'
                                  : 'text-gray-700'
                              }`}
                            >
                              {cycle.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  />
                  {errors.billingCycle && (
                    <Text className="text-red-500 text-sm mt-1">
                      {errors.billingCycle.message}
                    </Text>
                  )}
                </View>

                {/* Buttons */}
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={handleClose}
                    className="flex-1 bg-gray-200 py-3 rounded-xl"
                  >
                    <Text className="text-gray-700 text-center font-semibold text-base">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSubmit(onSubmit)}
                    className="flex-1 bg-blue-600 py-3 rounded-xl"
                  >
                    <Text className="text-white text-center font-semibold text-base">
                      Add Subscription
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
