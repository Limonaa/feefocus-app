import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Alert } from "react-native";
import "react-native-reanimated";
import "../global.css";
import { useEffect } from "react";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSettingsStore } from "@/stores/useSettingsStore";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const updateExchangeRates = useSettingsStore((state) => state.updateExchangeRates);
  const exchangeRates = useSettingsStore((state) => state.exchangeRates);

  useEffect(() => {
    const checkRates = async () => {
      const success = await updateExchangeRates();
      
      if (!success) {
        Alert.alert(
          "Currency rates are not up to date",
          `Failed to fetch the latest currency rates. Using rates from ${exchangeRates.lastUpdated}. Amounts may differ from current rates.`,
          [{ text: "OK" }]
        );
      }
    };
    
    checkRates();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
