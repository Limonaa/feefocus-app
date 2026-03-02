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

export async function schedulePaymentNotification(
  subscriptionId: string,
  subscriptionName: string,
  amount: number,
  currency: string,
  paymentDate: Date,
): Promise<string | null> {
  const notificationDate = new Date(paymentDate);
  notificationDate.setDate(notificationDate.getDate() - 1);
  notificationDate.setHours(10, 0, 0, 0); // 10:00 AM

  if (notificationDate.getTime() <= Date.now()) {
    return null;
  }

  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: "FeeFocus",
        body: `Tomorrow: Payment for ${subscriptionName} (${amount} ${currency})`,
        data: {
          type: "payment",
          subscriptionId,
          subscriptionName,
          amount,
          currency,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: notificationDate,
      },
    });
    return identifier;
  } catch (error) {
    console.error("Failed to schedule notification:", error);
    return null;
  }
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function cancelNotification(identifier: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

export async function cancelSubscriptionNotification(
  notificationId?: string,
): Promise<void> {
  if (notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error("Failed to cancel notification:", error);
    }
  }
}

export async function scheduleMonthlySummaryNotification(
  totalAmount: number,
  currency: string,
): Promise<string | null> {
  try {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    lastDay.setHours(16, 0, 0, 0);

    if (lastDay.getTime() <= Date.now()) {
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
      nextMonth.setHours(16, 0, 0, 0);
      lastDay.setTime(nextMonth.getTime());
    }

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: "FeeFocus",
        body: `This month you spent ${totalAmount.toFixed(2)} ${currency} on subscriptions`,
        data: {
          type: "monthly_summary",
          amount: totalAmount,
          currency,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: lastDay,
      },
    });
    return identifier;
  } catch (error) {
    console.error("Failed to schedule monthly notification:", error);
    return null;
  }
}
