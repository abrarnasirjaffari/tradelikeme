import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { initNotifications, setupNotificationHandlers } from '@/notifications/fcm';

const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#3B82F6',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    outline: '#E2E8F0',
  },
};

export default function RootLayout() {
  const loadToken = useAuthStore((s) => s.loadToken);

  useEffect(() => {
    loadToken();
    void initNotifications();
    const cleanupNotifications = setupNotificationHandlers();
    return () => {
      cleanupNotifications();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="strategy/[id]"
            options={{ title: 'Strategy Details', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="settings"
            options={{ title: 'Settings', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="notification"
            options={{ title: 'Notification', headerBackTitle: 'Back' }}
          />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
