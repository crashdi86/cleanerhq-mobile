import * as SecureStore from "expo-secure-store";

const KEYS = {
  ACCESS_TOKEN: "cleanerhq_access_token",
  REFRESH_TOKEN: "cleanerhq_refresh_token",
  EXPIRES_AT: "cleanerhq_expires_at",
} as const;

const isSecureStoreAvailable = process.env.EXPO_OS !== "web";

async function setItem(key: string, value: string): Promise<void> {
  if (isSecureStoreAvailable) {
    await SecureStore.setItemAsync(key, value);
  } else {
    localStorage.setItem(key, value);
  }
}

async function getItem(key: string): Promise<string | null> {
  if (isSecureStoreAvailable) {
    return SecureStore.getItemAsync(key);
  }
  return localStorage.getItem(key);
}

async function deleteItem(key: string): Promise<void> {
  if (isSecureStoreAvailable) {
    await SecureStore.deleteItemAsync(key);
  } else {
    localStorage.removeItem(key);
  }
}

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string; // ISO 8601
}

export const tokenStorage = {
  async saveTokens(tokens: StoredTokens): Promise<void> {
    await Promise.all([
      setItem(KEYS.ACCESS_TOKEN, tokens.accessToken),
      setItem(KEYS.REFRESH_TOKEN, tokens.refreshToken),
      setItem(KEYS.EXPIRES_AT, tokens.expiresAt),
    ]);
  },

  async getTokens(): Promise<StoredTokens | null> {
    const [accessToken, refreshToken, expiresAt] = await Promise.all([
      getItem(KEYS.ACCESS_TOKEN),
      getItem(KEYS.REFRESH_TOKEN),
      getItem(KEYS.EXPIRES_AT),
    ]);
    if (!accessToken || !refreshToken || !expiresAt) return null;
    return { accessToken, refreshToken, expiresAt };
  },

  async getAccessToken(): Promise<string | null> {
    return getItem(KEYS.ACCESS_TOKEN);
  },

  async clearTokens(): Promise<void> {
    await Promise.all([
      deleteItem(KEYS.ACCESS_TOKEN),
      deleteItem(KEYS.REFRESH_TOKEN),
      deleteItem(KEYS.EXPIRES_AT),
    ]);
  },
};
