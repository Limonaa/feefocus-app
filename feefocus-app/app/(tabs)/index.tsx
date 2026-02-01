import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import { Subscription } from '@/types/subscription';
import AddSubscriptionModal from '@/components/AddSubscriptionModal';

export default function HomeScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const addSubscription = useSubscriptionStore((state) => state.addSubscription);
  
  const totalMonthlyCost = subscriptions.reduce((total, sub) => {
    let monthlyPrice = sub.price;
    
    switch (sub.billingCycle) {
      case 'daily':
        monthlyPrice = sub.price * 30;
        break;
      case 'weekly':
        monthlyPrice = sub.price * 4;
        break;
      case 'monthly':
        monthlyPrice = sub.price;
        break;
      case 'quarterly':
        monthlyPrice = sub.price / 3;
        break;
      case 'yearly':
        monthlyPrice = sub.price / 12;
        break;
    }
    
    return total + monthlyPrice;
  }, 0);

  const renderSubscriptionItem = ({ item }: { item: Subscription }) => (
    <View className="bg-white p-4 mb-3 rounded-2xl shadow-sm">
      <Text className="text-lg font-semibold text-gray-900">
        {item.name}
      </Text>
      <Text className="text-base text-gray-600 mt-1">
        {item.price} {item.currency} / {item.billingCycle}
      </Text>
      <Text className="text-sm text-gray-400 mt-1">
        {item.category}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-blue-600 px-6 pt-16 pb-6">
        <Text className="text-white text-3xl font-bold">FeeFocus</Text>
        <View className="mt-4 bg-white/20 p-4 rounded-2xl">
          <Text className="text-white text-sm font-medium">Total Monthly Spending</Text>
          <Text className="text-white text-4xl font-bold mt-1">
            ${totalMonthlyCost.toFixed(2)}
          </Text>
        </View>
      </View>

      <View className="flex-1 p-4">
        <View className="flex-row mb-4">
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="flex-1 bg-blue-600 p-4 rounded-2xl active:opacity-80"
          >
            <Text className="text-white text-center font-semibold text-lg">
              Add Subscription
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={subscriptions}
          keyExtractor={(item) => item.id}
          renderItem={renderSubscriptionItem}
          ListEmptyComponent={
            <View className="items-center justify-center p-8">
              <Text className="text-gray-500 text-center text-base">
                No subscriptions yet. Tap "Add Subscription" to get started!
              </Text>
            </View>
          }
        />
      </View>

      <AddSubscriptionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}
