import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSubscriptionStore } from "@/stores/useSubscriptionStore";
import { Subscription } from "@/types/subscription";
import { Colors } from "@/constants/colors";

const subscriptionSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  price: z.string().refine(
    (val) => {
      const normalized = val.replace(",", ".");
      return !isNaN(Number(normalized)) && Number(normalized) > 0;
    },
    {
      message: "Price must be a positive number",
    },
  ),
  currency: z.enum(["PLN", "USD", "EUR", "GBP"]),
  billingCycle: z.enum(["monthly", "weekly", "yearly"]),
  category: z.string().optional(),
  nextPaymentDate: z.date(),
});

type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

interface AddSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
}

const currencies = [
  { value: "USD", symbol: "$" },
  { value: "EUR", symbol: "€" },
  { value: "GBP", symbol: "£" },
  { value: "PLN", symbol: "zł" },
] as const;

const billingCycles = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
] as const;

export default function AddSubscriptionModal({
  visible,
  onClose,
}: AddSubscriptionModalProps) {
  const addSubscription = useSubscriptionStore(
    (state) => state.addSubscription,
  );
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const weeklyScale = useSharedValue(1);
  const monthlyScale = useSharedValue(1);
  const yearlyScale = useSharedValue(1);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      name: "",
      price: "",
      currency: "PLN",
      billingCycle: "monthly",
      category: "",
      nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const selectedCurrency = watch("currency");
  const selectedBillingCycle = watch("billingCycle");

  const handleBillingCycleChange = (value: "weekly" | "monthly" | "yearly") => {
    const scaleValue =
      value === "weekly"
        ? weeklyScale
        : value === "monthly"
          ? monthlyScale
          : yearlyScale;

    scaleValue.value = 0.95;
    scaleValue.value = withSpring(1, { damping: 10, mass: 0.8 });

    control._formValues.billingCycle = value;
    watch("billingCycle");
  };

  const onSubmit = (data: SubscriptionFormData) => {
    const normalizedPrice = data.price.replace(",", ".");
    const newSubscription: Subscription = {
      id: Date.now().toString(),
      name: data.name,
      price: Number(normalizedPrice),
      currency: data.currency,
      billingCycle: data.billingCycle,
      category: data.category || "Other",
      nextPaymentDate: data.nextPaymentDate,
    };

    addSubscription(newSubscription);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    setShowCurrencyPicker(false);
    setShowDatePicker(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, backgroundColor: Colors.background.main }}
      >
        <View
          className="flex-row items-center px-4 pt-12"
          style={{
            backgroundColor: Colors.background.main,
            borderBottomColor: Colors.border.light,
          }}
        >
          <TouchableOpacity
            onPress={handleClose}
            className="w-12 h-12 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View style={{ borderTopColor: Colors.border.light }}>
            <Text
              className="text-xl font-bold px-4 pb-4 text-center"
              style={{ color: Colors.text.primary }}
            >
              Subscription Details
            </Text>

            <View className="px-4">
              <View className="mb-2">
                <Text
                  className="text-sm font-medium px-1"
                  style={{ color: Colors.text.secondary }}
                >
                  Service Name
                </Text>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, value } }) => (
                    <View
                      className="rounded-xl flex-row items-center px-4 border"
                      style={{
                        backgroundColor: Colors.background.card,
                        borderColor: Colors.border.light,
                      }}
                    >
                      <TextInput
                        className="flex-1 text-base font-medium pb-2 min-h-14"
                        style={{
                          color: Colors.text.primary,
                        }}
                        placeholder="e.g., Spotify"
                        placeholderTextColor={Colors.text.tertiary}
                        value={value}
                        onChangeText={onChange}
                      />
                    </View>
                  )}
                />
                {errors.name && (
                  <Text className="text-red-500 text-sm px-1">
                    {errors.name.message}
                  </Text>
                )}
              </View>

              <View className="mb-2">
                <Text
                  className="text-sm font-medium px-1"
                  style={{ color: Colors.text.secondary }}
                >
                  Price
                </Text>
                <View className="flex-row gap-3 relative">
                  <Controller
                    control={control}
                    name="currency"
                    render={({ field: { value } }) => (
                      <View style={{ position: "relative", zIndex: 10 }}>
                        <TouchableOpacity
                          onPress={() =>
                            setShowCurrencyPicker(!showCurrencyPicker)
                          }
                          className="w-28 h-14 rounded-xl flex-row items-center px-4 border"
                          style={{
                            backgroundColor: Colors.background.card,
                            borderColor: Colors.border.light,
                          }}
                        >
                          <Text
                            className="font-medium"
                            style={{ color: Colors.text.primary }}
                          >
                            {value}
                          </Text>
                          <Ionicons
                            name="chevron-down"
                            size={20}
                            color={Colors.text.secondary}
                            style={{ marginLeft: "auto" }}
                          />
                        </TouchableOpacity>
                        {showCurrencyPicker && (
                          <View
                            className="rounded-xl border overflow-hidden"
                            style={{
                              position: "absolute",
                              top: 58,
                              left: 0,
                              width: 112,
                              backgroundColor: Colors.background.card,
                              borderColor: Colors.border.light,
                              shadowColor: "#000",
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.15,
                              shadowRadius: 8,
                              elevation: 8,
                            }}
                          >
                            {currencies.map((curr, index) => (
                              <TouchableOpacity
                                key={curr.value}
                                onPress={() => {
                                  setValue("currency", curr.value);
                                  setShowCurrencyPicker(false);
                                }}
                                className="flex-row items-center px-4 py-3"
                                style={{
                                  borderBottomWidth:
                                    index < currencies.length - 1 ? 1 : 0,
                                  borderBottomColor: Colors.border.light,
                                }}
                              >
                                <Text
                                  className="font-medium"
                                  style={{ color: Colors.text.primary }}
                                >
                                  {curr.value} ({curr.symbol})
                                </Text>
                                {selectedCurrency === curr.value && (
                                  <Ionicons
                                    name="checkmark"
                                    size={20}
                                    color={Colors.primary}
                                    style={{ marginLeft: "auto" }}
                                  />
                                )}
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                      </View>
                    )}
                  />

                  <Controller
                    control={control}
                    name="price"
                    render={({ field: { onChange, value } }) => (
                      <View
                        className="flex-1 rounded-xl flex-row items-center px-4 border"
                        style={{
                          backgroundColor: Colors.background.card,
                          borderColor: Colors.border.light,
                        }}
                      >
                        <TextInput
                          className="flex-1 text-lg font-bold pb-2 min-h-14"
                          style={{ color: Colors.text.primary }}
                          placeholder="0.00"
                          placeholderTextColor={Colors.text.tertiary}
                          value={value}
                          onChangeText={onChange}
                          keyboardType="decimal-pad"
                        />
                      </View>
                    )}
                  />
                </View>
                {errors.price && (
                  <Text className="text-red-500 text-sm px-1">
                    {errors.price.message}
                  </Text>
                )}
              </View>

              <View className="mb-2">
                <Text
                  className="text-sm font-medium px-1"
                  style={{ color: Colors.text.secondary }}
                >
                  Billing Cycle
                </Text>
                <Controller
                  control={control}
                  name="billingCycle"
                  render={({ field: { onChange, value } }) => (
                    <View
                      className="flex-row p-1 rounded-xl border"
                      style={{
                        backgroundColor: Colors.background.card,
                        borderColor: Colors.border.light,
                      }}
                    >
                      {billingCycles.map((cycle) => {
                        const isSelected = value === cycle.value;
                        const scaleValue =
                          cycle.value === "weekly"
                            ? weeklyScale
                            : cycle.value === "monthly"
                              ? monthlyScale
                              : yearlyScale;

                        const animatedStyle = useAnimatedStyle(() => ({
                          transform: [{ scale: scaleValue.value }],
                        }));

                        return (
                          <TouchableOpacity
                            key={cycle.value}
                            onPress={() => {
                              onChange(cycle.value);
                              handleBillingCycleChange(
                                cycle.value as "weekly" | "monthly" | "yearly",
                              );
                            }}
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
                                {cycle.label}
                              </Text>
                            </Animated.View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                />
              </View>

              <View className="mb-2">
                <Text
                  className="text-sm font-medium px-1"
                  style={{ color: Colors.text.secondary }}
                >
                  Category{" "}
                  <Text style={{ color: Colors.text.tertiary }}>
                    (optional)
                  </Text>
                </Text>
                <Controller
                  control={control}
                  name="category"
                  render={({ field: { onChange, value } }) => (
                    <View
                      className="rounded-xl flex-row items-center px-4 border"
                      style={{
                        backgroundColor: Colors.background.card,
                        borderColor: Colors.border.light,
                      }}
                    >
                      <Ionicons
                        name="apps-outline"
                        size={20}
                        color={Colors.text.tertiary}
                      />
                      <TextInput
                        className="flex-1 ml-3 text-base font-medium pb-2 min-h-14"
                        style={{ color: Colors.text.primary }}
                        placeholder="e.g., Entertainment"
                        placeholderTextColor={Colors.text.tertiary}
                        value={value}
                        onChangeText={onChange}
                      />
                    </View>
                  )}
                />
              </View>

              <View>
                <Text
                  className="text-sm font-medium px-1"
                  style={{ color: Colors.text.secondary }}
                >
                  Next Payment
                </Text>
                <Controller
                  control={control}
                  name="nextPaymentDate"
                  render={({ field: { value, onChange } }) => (
                    <>
                      <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        activeOpacity={0.7}
                      >
                        <View
                          className="h-14 rounded-xl flex-row items-center px-4 border"
                          style={{
                            backgroundColor: Colors.background.card,
                            borderColor: Colors.border.light,
                          }}
                        >
                          <Ionicons
                            name="calendar-outline"
                            size={20}
                            color={Colors.text.tertiary}
                          />
                          <Text
                            className="flex-1 ml-3 text-base font-medium"
                            style={{ color: Colors.text.primary }}
                          >
                            {value.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </Text>
                          <Ionicons
                            name="create-outline"
                            size={20}
                            color={Colors.text.secondary}
                          />
                        </View>
                      </TouchableOpacity>
                      {showDatePicker && (
                        <View className="items-center justify-center mt-2">
                          <DateTimePicker
                            value={value}
                            mode="date"
                            display={
                              Platform.OS === "ios" ? "spinner" : "default"
                            }
                            onChange={(event, selectedDate) => {
                              setShowDatePicker(Platform.OS === "ios");
                              if (selectedDate) {
                                onChange(selectedDate);
                              }
                            }}
                            minimumDate={new Date()}
                            themeVariant="light"
                            accentColor={Colors.primary}
                          />
                        </View>
                      )}
                    </>
                  )}
                />
              </View>
            </View>
          </View>

          <View className="h-32" />
        </ScrollView>

        <View
          className="absolute bottom-4 left-0 right-0 p-4"
          style={{
            backgroundColor: Colors.background.main + "F2",
            borderTopColor: Colors.border.light,
          }}
        >
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            className="w-full py-4 rounded-xl flex-row items-center justify-center gap-2 shadow-xl"
            style={{ backgroundColor: Colors.primary }}
            activeOpacity={0.9}
          >
            <Ionicons name="add-circle" size={24} color={Colors.text.white} />
            <Text className="text-white font-bold text-lg">
              Add Subscription
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
