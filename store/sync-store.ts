/**
 * M-07 S6: Sync State Store.
 *
 * Tracks sync status for the auto-sync-on-reconnect flow.
 * Persists lastSyncedAt to AsyncStorage.
 */

import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@cleanerhq/sync_state";

interface SyncState {
  isSyncing: boolean;
  lastSyncedAt: number | null;
  syncError: string | null;

  setSyncing: (syncing: boolean) => void;
  setSyncedAt: (timestamp: number) => void;
  setSyncError: (error: string | null) => void;
  reset: () => void;
  restoreState: () => Promise<void>;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  isSyncing: false,
  lastSyncedAt: null,
  syncError: null,

  setSyncing: (syncing) => set({ isSyncing: syncing }),

  setSyncedAt: (timestamp) => {
    set({ lastSyncedAt: timestamp, syncError: null });
    void persistSyncState(timestamp);
  },

  setSyncError: (error) => set({ syncError: error }),

  reset: () => {
    set({ isSyncing: false, lastSyncedAt: null, syncError: null });
    void AsyncStorage.removeItem(STORAGE_KEY);
  },

  restoreState: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { lastSyncedAt?: number };
        if (parsed.lastSyncedAt) {
          set({ lastSyncedAt: parsed.lastSyncedAt });
        }
      }
    } catch {
      // Non-critical
    }
  },
}));

async function persistSyncState(lastSyncedAt: number): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ lastSyncedAt })
    );
  } catch {
    // Non-critical
  }
}
