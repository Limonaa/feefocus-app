import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { Subscription } from "@/types/subscription";

interface SubscriptionItemProps {
  item: Subscription;
}

const iconColors = [
  "#64748b",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#0ea5e9",
  "#475569",
];

const getColorForName = (name: string) => {
  const index = name.length % iconColors.length;
  return iconColors[index];
};

const getDaysUntilPayment = (nextPaymentDate: Date | string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const paymentDate = new Date(nextPaymentDate);
  paymentDate.setHours(0, 0, 0, 0);

  const diffTime = paymentDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

const getPaymentDateColor = (nextPaymentDate: Date | string): string => {
  const daysUntil = getDaysUntilPayment(nextPaymentDate);

  if (daysUntil <= 1) {
    return Colors.error;
  } else if (daysUntil <= 3) {
    return Colors.warning;
  }
  return Colors.text.tertiary;
};

export default function SubscriptionItem({ item }: SubscriptionItemProps) {
  return (
    <View className="flex-row items-center gap-4 bg-white border border-gray-200 rounded-2xl p-4">
      <View
        className="w-14 h-14 rounded-xl items-center justify-center"
        style={{ backgroundColor: getColorForName(item.name) }}
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
            color={getPaymentDateColor(item.nextPaymentDate)}
          />
          <Text
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: getPaymentDateColor(item.nextPaymentDate) }}
          >
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
    </View>
  );
}
