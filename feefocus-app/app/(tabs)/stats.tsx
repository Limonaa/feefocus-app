import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import { useSubscriptionStore } from "@/stores/useSubscriptionStore";
import { Subscription } from "@/types/subscription";
import { Colors } from "@/constants/colors";
import { PieChart } from "react-native-gifted-charts";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

type PeriodType = "monthly" | "yearly";

const periods = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
] as const;

export default function StatsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("monthly");
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const updateExpiredSubscriptions = useSubscriptionStore(
    (state) => state.updateExpiredSubscriptions,
  );

  const monthlyScale = useSharedValue(1);
  const yearlyScale = useSharedValue(1);

  useEffect(() => {
    updateExpiredSubscriptions();
  }, [updateExpiredSubscriptions]);

  const handlePeriodChange = (period: PeriodType) => {
    const scaleValue = period === "monthly" ? monthlyScale : yearlyScale;
    scaleValue.value = 0.95;
    scaleValue.value = withSpring(1, { damping: 10, mass: 0.8 });
    setSelectedPeriod(period);
  };

  const getTotalCost = (period: PeriodType) => {
    return subscriptions.reduce((total, sub) => {
      let cost = sub.price;

      if (period === "monthly") {
        switch (sub.billingCycle) {
          case "weekly":
            cost = sub.price * 4;
            break;
          case "monthly":
            cost = sub.price;
            break;
          case "yearly":
            cost = sub.price / 12;
            break;
        }
      } else {
        switch (sub.billingCycle) {
          case "weekly":
            cost = sub.price * 52;
            break;
          case "monthly":
            cost = sub.price * 12;
            break;
          case "yearly":
            cost = sub.price;
            break;
        }
      }

      return total + cost;
    }, 0);
  };

  const getActiveSubscriptions = () => {
    return subscriptions.filter((sub) => {
      const nextPaymentDate = new Date(sub.nextPaymentDate);
      return nextPaymentDate > new Date();
    }).length;
  };

  const getExpiredSubscriptions = () => {
    return subscriptions.filter((sub) => {
      const nextPaymentDate = new Date(sub.nextPaymentDate);
      return nextPaymentDate <= new Date();
    }).length;
  };

  const getPieChartData = () => {
    const colors = [
      "#f59e0b",
      "#135bec",
      "#10b981",
      "#FFA07A",
      "#98D8C8",
      "#F38181",
      "#AA96DA",
    ];

    const grouped: { [key: string]: number } = {};
    subscriptions.forEach((sub) => {
      grouped[sub.category] = (grouped[sub.category] || 0) + sub.price;
    });

    return Object.entries(grouped).map(([category, value], index) => ({
      value: value,
      color: colors[index % colors.length],
      text: category,
    }));
  };

  const totalCost = getTotalCost(selectedPeriod);
  const activeSubs = getActiveSubscriptions();
  const expiredSubs = getExpiredSubscriptions();

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: Colors.background.main }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-4 pt-12 pb-6">
        <Text
          className="text-3xl font-bold mb-6 text-center"
          style={{ color: Colors.text.primary }}
        >
          Statistics
        </Text>

        <View
          className="rounded-2xl border mb-6"
          style={{
            backgroundColor: Colors.background.card,
            borderColor: Colors.border.light,
          }}
        >
          <View className="p-6">
            <View
              className="flex-row p-1 rounded-xl border mb-6"
              style={{
                backgroundColor: Colors.background.main,
                borderColor: Colors.border.light,
              }}
            >
              {periods.map((period) => {
                const isSelected = selectedPeriod === period.value;
                const scaleValue =
                  period.value === "monthly" ? monthlyScale : yearlyScale;

                const animatedStyle = useAnimatedStyle(() => ({
                  transform: [{ scale: scaleValue.value }],
                }));

                return (
                  <TouchableOpacity
                    key={period.value}
                    onPress={() => handlePeriodChange(period.value)}
                    activeOpacity={0.7}
                    style={{ flex: 1 }}
                  >
                    <Animated.View
                      style={[
                        {
                          paddingVertical: 10,
                          borderRadius: 8,
                          backgroundColor: isSelected
                            ? Colors.primary
                            : "transparent",
                        },
                        animatedStyle,
                      ]}
                    >
                      <Text
                        className="text-center text-sm"
                        style={{
                          fontWeight: isSelected ? "bold" : "500",
                          color: isSelected
                            ? Colors.text.white
                            : Colors.text.secondary,
                        }}
                      >
                        {period.label}
                      </Text>
                    </Animated.View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {subscriptions.length > 0 && (
              <View className="items-center">
                <PieChart
                  data={getPieChartData()}
                  donut
                  radius={120}
                  innerRadius={80}
                  textColor={Colors.text.primary}
                  textSize={10}
                  centerLabelComponent={() => (
                    <View className="items-center">
                      <Text
                        className="text-base font-bold"
                        style={{ color: Colors.text.secondary }}
                      >
                        Total Spend
                      </Text>
                      <Text
                        className="text-2xl font-extrabold mt-1"
                        style={{ color: Colors.primary }}
                      >
                        {totalCost.toFixed(2)} PLN
                      </Text>
                    </View>
                  )}
                />
              </View>
            )}
          </View>
        </View>

        <View className="gap-4">
          <View
            className="rounded-2xl p-6 border"
            style={{
              backgroundColor: Colors.background.card,
              borderColor: Colors.border.light,
            }}
          >
            <Text
              className="text-sm font-medium mb-3"
              style={{ color: Colors.text.secondary }}
            >
              Total Cost ({selectedPeriod === "monthly" ? "Monthly" : "Yearly"})
            </Text>
            <Text
              className="text-3xl font-bold"
              style={{ color: Colors.primary }}
            >
              {totalCost.toFixed(2)} PLN
            </Text>
          </View>

          <View
            className="rounded-2xl p-6 border"
            style={{
              backgroundColor: Colors.background.card,
              borderColor: Colors.border.light,
            }}
          >
            <Text
              className="text-sm font-medium mb-3"
              style={{ color: Colors.text.secondary }}
            >
              Active Subscriptions
            </Text>
            <Text
              className="text-3xl font-bold"
              style={{ color: Colors.primary }}
            >
              {activeSubs}
            </Text>
          </View>

          {expiredSubs > 0 && (
            <View
              className="rounded-2xl p-6 border"
              style={{
                backgroundColor: Colors.background.card,
                borderColor: Colors.border.light,
              }}
            >
              <Text
                className="text-sm font-medium mb-3"
                style={{ color: Colors.text.secondary }}
              >
                Expired Subscriptions
              </Text>
              <Text
                className="text-3xl font-bold"
                style={{ color: Colors.error }}
              >
                {expiredSubs}
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
