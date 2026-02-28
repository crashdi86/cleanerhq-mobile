import { create } from "zustand";
import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: string | null;

  /** Call once in root layout. Returns unsubscribe function. */
  subscribe: () => () => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isConnected: true,
  isInternetReachable: null,
  connectionType: null,

  subscribe: () => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      set({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        connectionType: state.type,
      });
    });
    return unsubscribe;
  },
}));
