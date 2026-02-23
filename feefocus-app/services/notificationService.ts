import * as Notifications from "expo-notifications";
import { Alert, Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<boolean> {
  let finalStatus;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    Alert.alert(
      "Permission Required",
      "Please enable notifications in settings to stay updated.",
    );
    return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  return true;
}

export async function sendTestNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "FeeFocus Test",
      body: "Notification working",
      data: { type: "test" },
    },
    trigger: null,
  });
}

export async function schedulePaymentNotification(
  subscriptionName: string,
  amount: number,
  currency: string,
  date: Date,
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Upcomming payment!",
      body: `${subscriptionName}: ${amount} ${currency}`,
      data: {
        type: "payment",
        subscriptionName,
        amount,
        currency,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: date,
    },
  });
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function cancelNotification(identifier: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}
