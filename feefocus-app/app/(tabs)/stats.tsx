import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import { useSubscriptionStore } from "@/stores/useSubscriptionStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { convertCurrency } from "@/utils/currency";
import { Colors } from "@/constants/colors";
import { PieChart } from "react-native-gifted-charts";
import { Calendar } from "react-native-calendars";
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
  const defaultCurrency = useSettingsStore((state) => state.defaultCurrency);
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

      const convertedCost = convertCurrency(
        cost,
        sub.currency,
        defaultCurrency,
      );
      return total + convertedCost;
    }, 0);
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

  const getMarkedDates = () => {
    const marked: { [key: string]: any } = {};
    subscriptions.forEach((sub) => {
      const dateStr = new Date(sub.nextPaymentDate).toISOString().split("T")[0];
      marked[dateStr] = {
        marked: true,
        dotColor: Colors.primary,
        selectedColor: Colors.primary,
        selectedTextColor: Colors.text.white,
        selectedDayBackgroundColor: Colors.primary,
        customStyles: {
          text: {
            fontWeight: "bold",
            color: Colors.text.white,
          },
          container: {
            backgroundColor: Colors.primary,
          },
        },
      };
    });
    return marked;
  };

  const getAvgDaySpending = () => {
    return subscriptions.reduce((total, sub) => {
      let dailyCost = 0;
      switch (sub.billingCycle) {
        case "weekly":
          dailyCost = sub.price / 7;
          break;
        case "monthly":
          dailyCost = sub.price / 30;
          break;
        case "yearly":
          dailyCost = sub.price / 365;
          break;
      }
      const convertedDailyCost = convertCurrency(
        dailyCost,
        sub.currency,
        defaultCurrency,
      );
      return total + convertedDailyCost;
    }, 0);
  };

  const totalCost = getTotalCost(selectedPeriod);

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: Colors.background.main }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-4">
        <View className="flex-row items-center pt-14 justify-between pb-4 bg-[#f6f6f8]">
          <Text className="text-lg font-extrabold text-gray-900 tracking-tight">
            FeeFocus
          </Text>
        </View>
        <View>
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
                      className="text-center"
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
                      {totalCost.toFixed(2)} {defaultCurrency}
                    </Text>
                  </View>
                )}
              />
              <View className="mt-6 flex-row flex-wrap justify-start">
                {getPieChartData().map((item, index) => (
                  <View
                    key={index}
                    className="w-1/4 flex-row items-center gap-2 mb-4 px-1"
                  >
                    <View
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <Text style={{ color: Colors.text.secondary }}>
                      {item.text}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        <View className="h-0.5 bg-gray-300 mb-4 rounded-full" />

        <View
          className="mb-2 rounded-2xl p-6 relative overflow-hidden shadow-xl"
          style={{ backgroundColor: Colors.primary }}
        >
          <View className="absolute right-24 -top-5 w-12 h-12 rounded-full bg-white/30" />
          <View className="absolute -right-6 -bottom-8 w-20 h-20 rounded-full bg-black/30" />
          <View className="absolute -left-2 -bottom-8 w-16 h-16 rounded-full bg-black/10" />

          <View className="relative z-10">
            <Text className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">
              avg day spendings
            </Text>
            <Text className="text-4xl font-extrabold text-white tracking-tight">
              {getAvgDaySpending().toFixed(2)} {defaultCurrency}
            </Text>
          </View>
        </View>

        <View
          className="mt-4 mb-20 rounded-2xl overflow-hidden border"
          style={{
            backgroundColor: Colors.background.card,
            borderColor: Colors.border.light,
          }}
        >
          <Text
            className="text-2xl font-bold text-center mt-3"
            style={{ color: Colors.text.secondary }}
          >
            Billing Schedule
          </Text>
          <Calendar
            current={new Date().toISOString().split("T")[0]}
            markedDates={getMarkedDates()}
            markingType={"custom"}
            theme={{
              backgroundColor: Colors.background.card,
              calendarBackground: Colors.background.card,
              textSectionTitleColor: Colors.text.secondary,
              textSectionTitleDisabledColor: Colors.text.secondary,
              selectedDayBackgroundColor: Colors.primary,
              selectedDayTextColor: Colors.text.white,
              todayTextColor: Colors.primary,
              dayTextColor: Colors.text.primary,
              textDisabledColor: Colors.text.secondary,
              dotColor: Colors.primary,
              selectedDotColor: Colors.text.white,
              arrowColor: Colors.primary,
              monthTextColor: Colors.text.primary,
              textDayFontFamily: "System",
              textMonthFontSize: 16,
              textDayFontSize: 14,
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
}
