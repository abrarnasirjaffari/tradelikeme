import { Platform } from 'react-native';
import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import type { User } from '../types/api';

const AUTH_TOKEN_KEY = 'auth_token';

// ---------------------------------------------------------------------------
// Platform-aware storage: SecureStore on native, localStorage on web
// ---------------------------------------------------------------------------
const webStorage: StateStorage = {
  getItem: (name: string): string | null => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value);
    } catch {
      // ignore
    }
  },
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch {
      // ignore
    }
  },
};

function createNativeStorage(): StateStorage {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const SecureStore = require('expo-secure-store') as typeof import('expo-secure-store');
  return {
    getItem: async (name: string): Promise<string | null> => {
      return SecureStore.getItemAsync(name);
    },
    setItem: async (name: string, value: string): Promise<void> => {
      await SecureStore.setItemAsync(name, value);
    },
    removeItem: async (name: string): Promise<void> => {
      await SecureStore.deleteItemAsync(name);
    },
  };
}

const platformStorage: StateStorage =
  Platform.OS === 'web' ? webStorage : createNativeStorage();

// ---------------------------------------------------------------------------
// Direct SecureStore helpers (for token read/write outside persist)
// ---------------------------------------------------------------------------
async function readToken(): Promise<string | null> {
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

async function writeToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } catch {
      // ignore
    }
    return;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const SecureStore = require('expo-secure-store') as typeof import('expo-secure-store');
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

async function deleteToken(): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } catch {
      // ignore
    }
    return;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const SecureStore = require('expo-secure-store') as typeof import('expo-secure-store');
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setToken: (token: string) => Promise<void>;
  setUser: (user: User) => void;
  loadToken: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: true,

      setToken: async (token: string) => {
        await writeToken(token);
        set({ token });
      },

      setUser: (user: User) => {
        set({ user });
      },

      loadToken: async () => {
        try {
          const token = await readToken();
          set({ token, isLoading: false });
        } catch {
          set({ token: null, isLoading: false });
        }
      },

      logout: async () => {
        await deleteToken();
        set({ user: null, token: null, isLoading: false });
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => platformStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
