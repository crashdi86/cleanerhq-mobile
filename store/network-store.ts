/**
 * M-07 S2: Enhanced Network State Store.
 *
 * Improvements over base M-00 version:
 * - 1-second debounce on NetInfo listener (coalesce rapid changes in tunnels/elevators)
 * - AsyncStorage persistence for isConnected & lastOnlineAt (avoids flash of wrong state on cold start)
 * - `lastOnlineAt` timestamp for staleness display
 * - `wasOffline` flag for "just reconnected" detection
 * - 30-second periodic reachability fallback (AppState-aware)
 * - Hook point for SyncManager.onNetworkChange() (wired in S6)
 */

import { AppState, type AppStateStatus } from "react-native";
import { create } from "zustand";
import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@cleanerhq/network_state";
const DEBOUNCE_MS = 1_000;
const REACHABILITY_INTERVAL_MS = 30_000;

// Placeholder for SyncManager wiring (S6)
let onNetworkChangeCallback: ((isOnline: boolean) => void) | null = null;

export function setNetworkChangeCallback(
  cb: (isOnline: boolean) => void
): void {
  onNetworkChangeCallback = cb;
}

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: string | null;
  lastOnlineAt: number | null;
  wasOffline: boolean;

  /** Restore persisted network state from AsyncStorage (call on mount). */
  restoreState: () => Promise<void>;

  /** Call once in root layout. Returns unsubscribe function. */
  subscribe: () => () => void;
}

function computeIsOnline(
  isConnected: boolean,
  isInternetReachable: boolean | null
): boolean {
  return isConnected && isInternetReachable !== false;
}

export const useNetworkStore = create<NetworkState>((set, get) => ({
  isConnected: true,
  isInternetReachable: null,
  connectionType: null,
  lastOnlineAt: null,
  wasOffline: false,

  restoreState: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          isConnected?: boolean;
          lastOnlineAt?: number | null;
        };
        set({
          isConnected: parsed.isConnected ?? true,
          lastOnlineAt: parsed.lastOnlineAt ?? null,
        });
      }
    } catch {
      // Non-critical — start with defaults
    }
  },

  subscribe: () => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let reachabilityTimer: ReturnType<typeof setInterval> | null = null;
    let appStateSubscription: ReturnType<
      typeof AppState.addEventListener
    > | null = null;

    // ── Debounced NetInfo listener ──
    const handleNetInfoChange = (state: NetInfoState) => {
      if (debounceTimer) clearTimeout(debounceTimer);

      debounceTimer = setTimeout(() => {
        const prev = get();
        const newConnected = state.isConnected ?? false;
        const newReachable = state.isInternetReachable;
        const newOnline = computeIsOnline(newConnected, newReachable);
        const prevOnline = computeIsOnline(
          prev.isConnected,
          prev.isInternetReachable
        );

        const now = Date.now();
        const updates: Partial<NetworkState> = {
          isConnected: newConnected,
          isInternetReachable: newReachable,
          connectionType: state.type,
        };

        if (newOnline) {
          updates.lastOnlineAt = now;
        }

        // Detect "just came back online" transition
        if (newOnline && !prevOnline) {
          updates.wasOffline = true;
        } else if (!newOnline) {
          updates.wasOffline = false;
        }

        set(updates);

        // Persist key fields
        persistState(newConnected, newOnline ? now : prev.lastOnlineAt);

        // Notify SyncManager on transitions
        if (newOnline !== prevOnline && onNetworkChangeCallback) {
          onNetworkChangeCallback(newOnline);
        }
      }, DEBOUNCE_MS);
    };

    const unsubscribeNetInfo = NetInfo.addEventListener(handleNetInfoChange);

    // ── Periodic reachability check (30s) ──
    const startReachabilityPolling = () => {
      if (reachabilityTimer) return;
      reachabilityTimer = setInterval(async () => {
        try {
          const state = await NetInfo.fetch();
          handleNetInfoChange(state);
        } catch {
          // Silent — NetInfo.fetch() can fail when truly offline
        }
      }, REACHABILITY_INTERVAL_MS);
    };

    const stopReachabilityPolling = () => {
      if (reachabilityTimer) {
        clearInterval(reachabilityTimer);
        reachabilityTimer = null;
      }
    };

    // Start polling when app is active, stop when backgrounded
    startReachabilityPolling();

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        startReachabilityPolling();
        // Also do an immediate check on foreground
        NetInfo.fetch().then(handleNetInfoChange).catch(() => {});
      } else {
        stopReachabilityPolling();
      }
    };

    appStateSubscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // ── Cleanup ──
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      stopReachabilityPolling();
      unsubscribeNetInfo();
      appStateSubscription?.remove();
    };
  },
}));

// ── Persistence helper ──

async function persistState(
  isConnected: boolean,
  lastOnlineAt: number | null
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ isConnected, lastOnlineAt })
    );
  } catch {
    // Non-critical
  }
}
