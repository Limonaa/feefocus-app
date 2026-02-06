import { View, Text, ScrollView, TouchableOpacity, Modal } from "react-native";
import { Colors } from "@/constants/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const CURRENCIES = ["PLN", "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF"];

interface CurrencyModalProps {
  visible: boolean;
  onClose: () => void;
  selectedCurrency: string;
  onSelectCurrency: (currency: string) => void;
}

export default function CurrencyModal({
  visible,
  onClose,
  selectedCurrency,
  onSelectCurrency,
}: CurrencyModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <View
          className="rounded-2xl w-4/5 overflow-hidden"
          style={{ backgroundColor: Colors.background.card }}
        >
          <View
            className="px-6 py-4 border-b"
            style={{ borderColor: Colors.border.light }}
          >
            <Text
              className="text-lg font-bold"
              style={{ color: Colors.text.primary }}
            >
              Select Currency
            </Text>
          </View>

          <ScrollView>
            {CURRENCIES.map((currency) => (
              <TouchableOpacity
                key={currency}
                onPress={() => {
                  onSelectCurrency(currency);
                  onClose();
                }}
                className="flex-row items-center justify-between px-6 py-4 border-b active:opacity-60"
                style={{ borderColor: Colors.border.light }}
              >
                <Text
                  className="text-base"
                  style={{ color: Colors.text.primary }}
                >
                  {currency}
                </Text>
                {selectedCurrency === currency && (
                  <MaterialIcons
                    name="check"
                    size={24}
                    color={Colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View
            className="px-6 py-4 border-t"
            style={{ borderColor: Colors.border.light }}
          >
            <TouchableOpacity
              onPress={onClose}
              className="py-3 rounded-lg items-center"
              style={{ backgroundColor: Colors.primary }}
            >
              <Text className="font-bold text-white">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
