import { Platform } from 'react-native';
import axios from 'axios';
import axiosRetry from 'axios-retry';

const AUTH_TOKEN_KEY = 'auth_token';

async function getStoredToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    } catch {
      return null;
    }
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const SecureStore = require('expo-secure-store') as typeof import('expo-secure-store');
    return SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'https://api.tradelikeme.xyz',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

axiosRetry(apiClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) =>
    axiosRetry.isNetworkError(error) && !axiosRetry.isRetryableError(error)
      ? false
      : axiosRetry.isNetworkError(error),
});

apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // storage unavailable — proceed without token
  }
  return config;
});
