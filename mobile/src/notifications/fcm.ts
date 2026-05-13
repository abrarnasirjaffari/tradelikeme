import { Alert, Platform } from 'react-native';
import { router } from 'expo-router';

// expo-notifications is native-only — dynamically import only on native
// to avoid "invariant violation" errors in web environments.
let Notifications: typeof import('expo-notifications') | null = null;
if (Platform.OS !== 'web') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Notifications = require('expo-notifications');
}

const API_BASE = 'https://api.tradelikeme.xyz';

// ---------------------------------------------------------------------------
// Notification routing map
// ---------------------------------------------------------------------------
type NotificationEventType =
  | 'ZONE_TOUCH'
  | 'TRADE_ENTERED'
  | 'TP1_HIT'
  | 'TP2_HIT'
  | 'SL_HIT'
  | 'BALANCE_LOW'
  | 'AGENT_DOWN'
  | 'DAILY_SUMMARY';

const ROUTE_MAP: Record<NotificationEventType, string> = {
  ZONE_TOUCH: '/(tabs)/trades',
  TRADE_ENTERED: '/(tabs)/trades',
  TP1_HIT: '/(tabs)/trades',
  TP2_HIT: '/(tabs)/trades',
  SL_HIT: '/(tabs)/trades',
  BALANCE_LOW: '/(tabs)/vault',
  AGENT_DOWN: '/(tabs)/vault',
  DAILY_SUMMARY: '/(tabs)/dashboard',
};

function routeForEventType(eventType: string): string {
  return (ROUTE_MAP as Record<string, string>)[eventType] ?? '/(tabs)/dashboard';
}

// ---------------------------------------------------------------------------
// Permission + token initialisation
// ---------------------------------------------------------------------------
export async function initNotifications(): Promise<void> {
  if (Platform.OS === 'web' || !Notifications) {
    // Push notifications are not supported on web — skip silently
    return;
  }

  // Set foreground presentation options before requesting permission
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    // Permission denied — notifications will not fire, but the app continues
    return;
  }

  // On Android, a notification channel is required for heads-up alerts
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'TradeLikeMe Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00D4AA',
      sound: 'default',
    });
  }
}

// ---------------------------------------------------------------------------
// Send FCM token to backend
// ---------------------------------------------------------------------------
export async function sendTokenToBackend(
  userId: string,
  token: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/notifications/config`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, fcmToken: token }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to register FCM token: ${response.status} ${response.statusText}`
    );
  }
}

// ---------------------------------------------------------------------------
// Register and return push tokens
// ---------------------------------------------------------------------------
export async function registerForPushNotifications(userId: string): Promise<{
  expoPushToken: string | null;
  fcmToken: string | null;
}> {
  if (Platform.OS === 'web' || !Notifications) {
    return { expoPushToken: null, fcmToken: null };
  }

  let expoPushToken: string | null = null;
  let fcmToken: string | null = null;

  try {
    const expoPushTokenData = await Notifications.getExpoPushTokenAsync();
    expoPushToken = expoPushTokenData.data;
  } catch {
    // Expo push token unavailable in some environments
  }

  if (Platform.OS === 'android') {
    try {
      const devicePushToken = await Notifications.getDevicePushTokenAsync();
      if (devicePushToken.type === 'android') {
        fcmToken = devicePushToken.data as string;
      }
    } catch {
      // FCM token unavailable
    }
  }

  const tokenToSend = fcmToken ?? expoPushToken;
  if (tokenToSend && userId) {
    try {
      await sendTokenToBackend(userId, tokenToSend);
    } catch {
      // Non-fatal: backend registration failure does not block the app
    }
  }

  return { expoPushToken, fcmToken };
}

// ---------------------------------------------------------------------------
// Notification handlers
// ---------------------------------------------------------------------------
let foregroundSubscription: { remove: () => void } | null = null;
let responseSubscription: { remove: () => void } | null = null;

export function setupNotificationHandlers(): () => void {
  if (Platform.OS === 'web' || !Notifications) {
    // Not supported on web — return a no-op cleanup
    return () => {};
  }

  // Foreground handler — show an alert while the app is active
  foregroundSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      const { title, body } = notification.request.content;
      Alert.alert(
        title ?? 'TradeLikeMe',
        body ?? '',
        [{ text: 'OK', style: 'default' }],
        { cancelable: true }
      );
    }
  );

  // Background / tap handler — navigate when user taps a notification
  responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const data = response.notification.request.content.data as
        | Record<string, unknown>
        | undefined;

      const eventType =
        (data?.type as string | undefined) ??
        (data?.eventType as string | undefined) ??
        '';

      const route = routeForEventType(eventType);

      try {
        router.push(route as Parameters<typeof router.push>[0]);
      } catch {
        // Router may not be ready during cold-start; best-effort navigation
      }
    }
  );

  // Return cleanup function
  return () => {
    foregroundSubscription?.remove();
    responseSubscription?.remove();
    foregroundSubscription = null;
    responseSubscription = null;
  };
}

export { initNotifications as default };
