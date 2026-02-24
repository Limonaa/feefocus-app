import { View, Text, FlatList } from "react-native";
import { useSubscriptionStore } from "@/stores/useSubscriptionStore";
import { SubscriptionHistory } from "@/types/subscription";
import { useMemo, useState } from "react";
import SearchBar from "@/components/SearchBar";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";

type HistoryItemWithName = SubscriptionHistory & {
  subscriptionName: string;
  subscriptionId: string;
};

export default function HistoryScreen() {
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const allHistory = useMemo(() => {
    const history: HistoryItemWithName[] = [];

    subscriptions.forEach((sub) => {
      if (sub.history && sub.history.length > 0) {
        sub.history.forEach((entry) => {
          history.push({
            ...entry,
            subscriptionName: sub.name,
            subscriptionId: sub.id,
          });
        });
      }
    });

    return history.sort(
      (a, b) =>
        new Date(b.periodEnd).getTime() - new Date(a.periodEnd).getTime(),
    );
  }, [subscriptions]);

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) {
      return allHistory;
    }

    const query = searchQuery.toLowerCase();
    return allHistory.filter((item) =>
      item.subscriptionName.toLowerCase().includes(query),
    );
  }, [allHistory, searchQuery]);

  if (allHistory.length === 0) {
    return (
      <View className="flex-1 bg-[#f6f6f8] items-center justify-center px-6">
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Payment history
        </Text>
        <Text className="text-base text-gray-500 text-center">
          No payment history. History will be saved each time your subscription
          is renewed.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f6f6f8]">
      <SearchBar
        showSearch={showSearch}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleSearch={setShowSearch}
        placeholder="Search history..."
      />

      {filteredHistory.length === 0 && searchQuery.trim() ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons
            name="search-outline"
            size={48}
            color={Colors.text.tertiary}
          />
          <Text className="text-gray-500 text-center text-base mt-4">
            No payment history found for "{searchQuery}"
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredHistory}
          className="px-4 mb-24"
          keyExtractor={(item, index) => `${item.subscriptionId}-${index}`}
          renderItem={({ item }) => (
            <View className="flex-row items-center gap-4 bg-white border border-gray-200 rounded-2xl p-4 mb-3">
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900 mb-1">
                  {item.subscriptionName}
                </Text>
                <View className="flex-row items-center gap-1.5 mt-1">
                  <Ionicons
                    name="calendar-outline"
                    size={12}
                    color={Colors.primary}
                  />
                  <Text
                    className="text-xs font-medium uppercase tracking-wide"
                    style={{ color: Colors.primary }}
                  >
                    {new Date(item.periodStart).toISOString().split("T")[0]} -{" "}
                    {new Date(item.periodEnd).toISOString().split("T")[0]}
                  </Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-lg font-extrabold text-gray-900">
                  {item.price + " " + item.currency}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
