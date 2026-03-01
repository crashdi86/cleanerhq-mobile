/**
 * M-07 S2: Convenience hook for network state.
 *
 * Returns a flat object with computed `isOnline` boolean
 * (connected AND reachable), plus all raw fields.
 */

import { useNetworkStore } from "@/store/network-store";

interface NetworkStateInfo {
  /** True when connected AND internet is reachable (not explicitly false). */
  isOnline: boolean;
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: string | null;
  lastOnlineAt: number | null;
  wasOffline: boolean;
}

export function useNetworkState(): NetworkStateInfo {
  const isConnected = useNetworkStore((s) => s.isConnected);
  const isInternetReachable = useNetworkStore((s) => s.isInternetReachable);
  const connectionType = useNetworkStore((s) => s.connectionType);
  const lastOnlineAt = useNetworkStore((s) => s.lastOnlineAt);
  const wasOffline = useNetworkStore((s) => s.wasOffline);

  return {
    isOnline: isConnected && isInternetReachable !== false,
    isConnected,
    isInternetReachable,
    connectionType,
    lastOnlineAt,
    wasOffline,
  };
}
