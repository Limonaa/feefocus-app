import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { useSubscriptionStore } from "@/stores/useSubscriptionStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { convertCurrency } from "@/utils/currency";
import { Subscription } from "@/types/subscription";
import AddSubscriptionModal from "@/components/AddSubscriptionModal";
import SwipeableItem from "@/components/SwipeableItem";
import SubscriptionItem from "@/components/SubscriptionItem";
import SearchBar from "@/components/SearchBar";
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
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const removeSubscription = useSubscriptionStore(
    (state) => state.removeSubscription,
  );
  const defaultCurrency = useSettingsStore((state) => state.defaultCurrency);
  const updateExpiredSubscriptions = useSubscriptionStore(
    (state) => state.updateExpiredSubscriptions,
  );

  useEffect(() => {
    updateExpiredSubscriptions();
  }, [updateExpiredSubscriptions]);

  const getSortedSubscriptions = () => {
    let filtered = [...subscriptions];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (sub) =>
          sub.name.toLowerCase().includes(query) ||
          sub.category?.toLowerCase().includes(query),
      );
    }

    switch (sortType) {
      case "alphabetical":
        return filtered.sort((a, b) =>
          isReversed
            ? b.name.localeCompare(a.name)
            : a.name.localeCompare(b.name),
        );
      case "date":
        return filtered.sort((a, b) => {
          const comparison =
            new Date(a.nextPaymentDate).getTime() -
            new Date(b.nextPaymentDate).getTime();
          return isReversed ? -comparison : comparison;
        });
      case "price":
        return filtered.sort((a, b) =>
          isReversed ? a.price - b.price : b.price - a.price,
        );
      default:
        return isReversed ? filtered.reverse() : filtered;
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

    const convertedPrice = convertCurrency(
      monthlyPrice,
      sub.currency,
      defaultCurrency,
    );

    return total + convertedPrice;
  }, 0);

  return (
    <View className="flex-1 bg-[#f6f6f8]">
      <SearchBar
        showSearch={showSearch}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleSearch={setShowSearch}
        placeholder="Search subscriptions..."
      />

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
              {totalMonthlyCost.toFixed(2)} {defaultCurrency}
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
              className="rounded-xl border overflow-hidden absolute top-12 right-0 w-48 bg-white z-50"
              style={{
                borderColor: Colors.border.light,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 8,
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
        ) : sortedSubscriptions.length === 0 ? (
          <View className="items-center justify-center p-8">
            <Ionicons
              name="search-outline"
              size={48}
              color={Colors.text.tertiary}
            />
            <Text className="text-gray-500 text-center text-base mt-4">
              No subscriptions found for "{searchQuery}"
            </Text>
          </View>
        ) : (
          sortedSubscriptions.map((item) => (
            <SwipeableItem
              key={item.id}
              onEdit={() => {
                setEditingSubscription(item);
                setModalVisible(true);
              }}
              onDelete={() => removeSubscription(item.id)}
            >
              <SubscriptionItem item={item} />
            </SwipeableItem>
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
