import axios from 'axios';
import axiosRetry from 'axios-retry';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useAuthStore } from '@/store/authStore';
import type { User } from '@/types/api';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://auth.tradelikeme.xyz';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

axiosRetry(apiClient, { retries: 2, retryDelay: axiosRetry.exponentialDelay });

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

async function login(payload: LoginPayload): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>('/api/auth/sign-in/email', payload);
  const { token, user } = res.data;
  const store = useAuthStore.getState();
  await store.setToken(token);
  store.setUser(user);
  return res.data;
}

async function signup(payload: SignupPayload): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>('/api/auth/sign-up/email', payload);
  const { token, user } = res.data;
  const store = useAuthStore.getState();
  await store.setToken(token);
  store.setUser(user);
  return res.data;
}

async function sendMagicLink(email: string): Promise<void> {
  await apiClient.post('/api/auth/magic-link/send', { email });
}

async function googleOAuth(): Promise<void> {
  const redirectUri = Linking.createURL('/auth/callback');
  const authUrl = `${BASE_URL}/api/auth/sign-in/social?provider=google&redirect_uri=${encodeURIComponent(redirectUri)}`;
  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
  if (result.type === 'success' && result.url) {
    const parsed = Linking.parse(result.url);
    const token = parsed.queryParams?.token as string | undefined;
    if (token) {
      await useAuthStore.getState().setToken(token);
    }
  }
}

async function githubOAuth(): Promise<void> {
  const redirectUri = Linking.createURL('/auth/callback');
  const authUrl = `${BASE_URL}/api/auth/sign-in/social?provider=github&redirect_uri=${encodeURIComponent(redirectUri)}`;
  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
  if (result.type === 'success' && result.url) {
    const parsed = Linking.parse(result.url);
    const token = parsed.queryParams?.token as string | undefined;
    if (token) {
      await useAuthStore.getState().setToken(token);
    }
  }
}

async function logout(): Promise<void> {
  await apiClient.post('/api/auth/sign-out');
  const store = useAuthStore.getState();
  await store.logout();
}

async function getSession(): Promise<{ user: User; token: string } | null> {
  try {
    const res = await apiClient.get<{ user: User; token: string }>(
      '/api/auth/get-session'
    );
    return res.data;
  } catch {
    return null;
  }
}

export const auth = {
  login,
  signup,
  logout,
  sendMagicLink,
  googleOAuth,
  githubOAuth,
  getSession,
};
