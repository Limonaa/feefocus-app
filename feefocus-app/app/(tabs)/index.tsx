import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useSubscriptionStore } from "@/stores/useSubscriptionStore";
import { Subscription } from "@/types/subscription";
import AddSubscriptionModal from "@/components/AddSubscriptionModal";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";

export default function HomeScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | undefined>(undefined);
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);

  const totalMonthlyCost = subscriptions.reduce((total, sub) => {
    let monthlyPrice = sub.price;

    switch (sub.billingCycle) {
      case "weekly":
        monthlyPrice = sub.price * 4;
        break;
      case "monthly":
        monthlyPrice = sub.price;
        break;
      case "yearly":
        monthlyPrice = sub.price / 12;
        break;
    }

    return total + monthlyPrice;
  }, 0);

  const renderSubscriptionItem = ({ item }: { item: Subscription }) => (
    <TouchableOpacity
      className="flex-row items-center gap-4 bg-white border border-gray-200 rounded-2xl p-4 mb-3"
      activeOpacity={0.7}
      onPress={() => {
        setEditingSubscription(item);
        setModalVisible(true);
      }}
    >
      <View
        className="w-14 h-14 rounded-xl items-center justify-center"
        style={{ backgroundColor: Colors.primary }}
      >
        <Text className="text-white text-2xl font-bold">
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-gray-900 mb-1">
          {item.name}
        </Text>
        <View className="flex-row items-center gap-1.5 mt-1">
          <Ionicons
            name="calendar-outline"
            size={12}
            color={Colors.text.tertiary}
          />
          <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {new Date(item.nextPaymentDate).toISOString().split("T")[0]}
          </Text>
        </View>
      </View>
      <View className="items-end">
        <Text className="text-lg font-extrabold text-gray-900">
          {item.price + " " + item.currency}
        </Text>
        {item.category && (
          <Text className="text-[10px] font-bold text-gray-400 mt-0.5">
            {item.category.toUpperCase()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-[#f6f6f8]">
      <View className="flex-row items-center justify-between px-4 pt-14 pb-4 bg-[#f6f6f8]">
        <Text className="text-lg font-extrabold text-gray-900 tracking-tight">
          FeeFocus
        </Text>
        <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-200/50 items-center justify-center">
          <Ionicons name="search" size={20} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      <View
        className="mx-4 mb-2 rounded-2xl p-6 relative overflow-hidden shadow-xl"
        style={{ backgroundColor: Colors.primary }}
      >
        <View className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
        <View className="absolute left-12 -top-3 w-8 h-8 rounded-full bg-white/30" />
        <View className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-black/20" />
        <View className="absolute right-24 -bottom-8 w-24 h-24 rounded-full bg-black/10" />

        <View className="relative z-10">
          <Text className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">
            MONTHLY SPENDING
          </Text>
          <View className="flex-row items-baseline gap-1">
            <Text className="text-4xl font-extrabold text-white tracking-tight">
              ${totalMonthlyCost.toFixed(2)}
            </Text>
            <Text className="text-base font-medium text-white/70">/ mo</Text>
          </View>
          <View className="mt-6">
            <Text className="text-[11px] font-medium text-white/60">
              Total Active
            </Text>
            <Text className="text-sm font-bold text-white mt-0.5">
              {subscriptions.length} Services
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row items-center justify-between px-4 pt-2 pb-3">
        <Text className="text-lg font-bold text-gray-900 tracking-tight">
          Active Services
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {subscriptions.length === 0 ? (
          <View className="items-center justify-center p-8">
            <Text className="text-gray-500 text-center text-base">
              No subscriptions yet. Tap + to add one!
            </Text>
          </View>
        ) : (
          subscriptions.map((item) => (
            <View key={item.id}>{renderSubscriptionItem({ item })}</View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        className="absolute bottom-24 right-6 w-14 h-14 rounded-full items-center justify-center shadow-xl"
        style={{ backgroundColor: Colors.primary }}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={32} color="#ffffff" />
      </TouchableOpacity>

      <AddSubscriptionModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingSubscription(undefined);
        }}
        editSubscription={editingSubscription}
      />
    </View>
  );
}
