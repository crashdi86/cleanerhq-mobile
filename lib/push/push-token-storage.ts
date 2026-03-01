import AsyncStorage from "@react-native-async-storage/async-storage";

const PUSH_TOKEN_KEY = "@cleanerhq/push_token";

/**
 * AsyncStorage wrapper for push token deduplication.
 * Stores the last registered push token to avoid redundant
 * POST /devices/register calls when the token hasn't changed.
 */
export const pushTokenStorage = {
  async getLastRegisteredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(PUSH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async setLastRegisteredToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
    } catch {
      // Non-critical — worst case we re-register next launch
    }
  },

  async clearToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
    } catch {
      // Ignore
    }
  },
};
