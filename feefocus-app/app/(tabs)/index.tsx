import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { useSubscriptionStore } from "@/stores/useSubscriptionStore";
import { Subscription } from "@/types/subscription";
import AddSubscriptionModal from "@/components/AddSubscriptionModal";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";

type SortType = "alphabetical" | "date" | "price" | "none";

export default function HomeScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<
    Subscription | undefined
  >(undefined);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortType, setSortType] = useState<SortType>("none");
  const [isReversed, setIsReversed] = useState(false);
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const updateExpiredSubscriptions = useSubscriptionStore(
    (state) => state.updateExpiredSubscriptions,
  );

  useEffect(() => {
    updateExpiredSubscriptions();
  }, [updateExpiredSubscriptions]);

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

  const getSortedSubscriptions = () => {
    const sorted = [...subscriptions];

    switch (sortType) {
      case "alphabetical":
        return sorted.sort((a, b) =>
          isReversed
            ? b.name.localeCompare(a.name)
            : a.name.localeCompare(b.name),
        );
      case "date":
        return sorted.sort((a, b) => {
          const comparison =
            new Date(a.nextPaymentDate).getTime() -
            new Date(b.nextPaymentDate).getTime();
          return isReversed ? -comparison : comparison;
        });
      case "price":
        return sorted.sort((a, b) =>
          isReversed ? a.price - b.price : b.price - a.price,
        );
      default:
        return isReversed ? sorted.reverse() : sorted;
    }
  };

  const sortedSubscriptions = getSortedSubscriptions();

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
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-[#f6f6f8]">
      <View className="flex-row justify-between px-4 pt-14 pb-4 bg-[#f6f6f8]">
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
        <View
          className="flex-row items-center gap-2"
          style={{ position: "relative" }}
        >
          <TouchableOpacity
            onPress={() => setIsReversed(!isReversed)}
            className="w-10 h-10 rounded-full bg-gray-200/50 items-center justify-center"
          >
            <Ionicons
              name={isReversed ? "arrow-down" : "arrow-up"}
              size={18}
              color={isReversed ? Colors.primary : Colors.text.secondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowSortMenu(!showSortMenu)}
            className="w-10 h-10 rounded-full bg-gray-200/50 items-center justify-center"
          >
            <Ionicons
              name={sortType === "none" ? "funnel-outline" : "funnel"}
              size={18}
              color={
                sortType === "none" ? Colors.text.secondary : Colors.primary
              }
            />
          </TouchableOpacity>

          {showSortMenu && (
            <View
              className="rounded-xl border overflow-hidden"
              style={{
                position: "absolute",
                top: 45,
                right: 0,
                width: 180,
                backgroundColor: "white",
                borderColor: Colors.border.light,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 8,
                zIndex: 1000,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setSortType("none");
                  setShowSortMenu(false);
                }}
                className="flex-row items-center px-4 py-3 border-b"
                style={{ borderBottomColor: Colors.border.light }}
              >
                <Ionicons
                  name="list-outline"
                  size={18}
                  color={Colors.text.secondary}
                />
                <Text
                  className="ml-3 font-medium"
                  style={{ color: Colors.text.primary }}
                >
                  Default
                </Text>
                {sortType === "none" && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={Colors.primary}
                    style={{ marginLeft: "auto" }}
                  />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setSortType("alphabetical");
                  setShowSortMenu(false);
                }}
                className="flex-row items-center px-4 py-3 border-b"
                style={{ borderBottomColor: Colors.border.light }}
              >
                <Ionicons
                  name="text-outline"
                  size={18}
                  color={Colors.text.secondary}
                />
                <Text
                  className="ml-3 font-medium"
                  style={{ color: Colors.text.primary }}
                >
                  Alphabetical
                </Text>
                {sortType === "alphabetical" && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={Colors.primary}
                    style={{ marginLeft: "auto" }}
                  />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setSortType("date");
                  setShowSortMenu(false);
                }}
                className="flex-row items-center px-4 py-3 border-b"
                style={{ borderBottomColor: Colors.border.light }}
              >
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={Colors.text.secondary}
                />
                <Text
                  className="ml-3 font-medium"
                  style={{ color: Colors.text.primary }}
                >
                  Payment Date
                </Text>
                {sortType === "date" && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={Colors.primary}
                    style={{ marginLeft: "auto" }}
                  />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setSortType("price");
                  setShowSortMenu(false);
                }}
                className="flex-row items-center px-4 py-3"
              >
                <Ionicons
                  name="cash-outline"
                  size={18}
                  color={Colors.text.secondary}
                />
                <Text
                  className="ml-3 font-medium"
                  style={{ color: Colors.text.primary }}
                >
                  Price
                </Text>
                {sortType === "price" && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={Colors.primary}
                    style={{ marginLeft: "auto" }}
                  />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
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
          sortedSubscriptions.map((item) => (
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
