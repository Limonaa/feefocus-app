import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { useState } from "react";
import { useSubscriptionStore } from "@/stores/useSubscriptionStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { Colors } from "@/constants/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import CurrencyModal from "@/components/CurrencyModal";

export default function SettingsScreen() {
  const defaultCurrency = useSettingsStore((state) => state.defaultCurrency);
  const setDefaultCurrency = useSettingsStore(
    (state) => state.setDefaultCurrency,
  );
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [upcomingPaymentsNotif, setUpcomingPaymentsNotif] = useState(true);
  const [monthlySummaryNotif, setMonthlySummaryNotif] = useState(true);
  const deleteSubscriptions = useSubscriptionStore(
    (state) => state.deleteSubscriptions,
  );

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to delete all subscriptions? This action cannot be undone.",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            deleteSubscriptions();
          },
          style: "destructive",
        },
      ],
    );
  };

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: Colors.background.main }}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-12 pb-6">
          <Text
            className="text-3xl font-bold mb-8 text-center"
            style={{ color: Colors.text.primary }}
          >
            Settings
          </Text>

          <View className="mb-8">
            <Text
              className="text-xs font-semibold mb-3 px-2 uppercase tracking-wider"
              style={{ color: Colors.text.secondary }}
            >
              General
            </Text>
            <View
              className="rounded-2xl overflow-hidden border"
              style={{
                backgroundColor: Colors.background.card,
                borderColor: Colors.border.light,
              }}
            >
              <TouchableOpacity
                onPress={() => setCurrencyModalVisible(true)}
                className="flex-row items-center px-4 py-4 gap-4 active:opacity-70"
              >
                <View
                  className="flex items-center justify-center w-10 h-10 rounded-lg"
                  style={{ backgroundColor: `${Colors.primary}20` }}
                >
                  <MaterialIcons
                    name="payments"
                    size={22}
                    color={Colors.primary}
                  />
                </View>
                <View className="flex-1 flex-row items-center justify-between">
                  <Text
                    className="text-base font-medium"
                    style={{ color: Colors.text.primary }}
                  >
                    Base Currency
                  </Text>
                  <View className="flex-row items-center gap-1">
                    <Text
                      className="text-lg"
                      style={{ color: Colors.text.secondary }}
                    >
                      {defaultCurrency}
                    </Text>
                    <MaterialIcons
                      name="chevron-right"
                      size={20}
                      color={Colors.text.secondary}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-8">
            <Text
              className="text-xs font-semibold mb-3 px-2 uppercase tracking-wider"
              style={{ color: Colors.text.secondary }}
            >
              Notifications
            </Text>
            <View
              className="rounded-2xl overflow-hidden border"
              style={{
                backgroundColor: Colors.background.card,
                borderColor: Colors.border.light,
              }}
            >
              <View
                className="flex-row items-center px-4 py-4 gap-4 border-b"
                style={{ borderColor: Colors.border.light }}
              >
                <View
                  className="flex items-center justify-center w-10 h-10 rounded-lg"
                  style={{ backgroundColor: "#f97316" + "20" }}
                >
                  <MaterialIcons
                    name="notifications-active"
                    size={22}
                    color="#f97316"
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-base font-medium"
                    style={{ color: Colors.text.primary }}
                  >
                    Upcoming Payments
                  </Text>
                </View>
                <Switch
                  value={upcomingPaymentsNotif}
                  onValueChange={setUpcomingPaymentsNotif}
                  trackColor={{
                    false: Colors.border.light,
                    true: Colors.primary,
                  }}
                  thumbColor={Colors.text.white}
                />
              </View>

              <View className="flex-row items-center px-4 py-4 gap-4">
                <View
                  className="flex items-center justify-center w-10 h-10 rounded-lg"
                  style={{ backgroundColor: "#10b98120" }}
                >
                  <MaterialIcons name="insights" size={22} color="#10b981" />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-base font-medium"
                    style={{ color: Colors.text.primary }}
                  >
                    Monthly Summary
                  </Text>
                </View>
                <Switch
                  value={monthlySummaryNotif}
                  onValueChange={setMonthlySummaryNotif}
                  trackColor={{
                    false: Colors.border.light,
                    true: Colors.primary,
                  }}
                  thumbColor={Colors.text.white}
                />
              </View>
            </View>
          </View>

          <Text
            className="text-xs font-semibold mb-3 px-2 uppercase tracking-wider"
            style={{ color: Colors.text.secondary }}
          >
            storage
          </Text>
          <View className="mb-8">
            <TouchableOpacity
              onPress={handleClearData}
              className="rounded-2xl px-6 py-4 border"
              style={{
                backgroundColor: "#ef4444" + "15",
                borderColor: "#ef4444" + "30",
              }}
            >
              <Text
                className="text-center font-bold text-base"
                style={{ color: "#dc2626" }}
              >
                Clear All Data
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View
        className="mb-20 px-4 py-2 items-center gap-1 flex-row justify-end"
        style={{ backgroundColor: Colors.background.main }}
      >
        <Text
          className="text-xs font-medium"
          style={{ color: Colors.text.primary }}
        >
          FeeFocus
        </Text>
        <Text className="text-xs" style={{ color: Colors.text.secondary }}>
          v0.3.1
        </Text>
      </View>

      <CurrencyModal
        visible={currencyModalVisible}
        onClose={() => setCurrencyModalVisible(false)}
        selectedCurrency={defaultCurrency}
        onSelectCurrency={setDefaultCurrency}
      />
    </View>
  );
}
