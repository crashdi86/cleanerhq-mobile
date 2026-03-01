import { create } from "zustand";

type PermissionStatus = "granted" | "denied" | "undetermined";

interface NotificationState {
  unreadCount: number;
  pushToken: string | null;
  permissionStatus: PermissionStatus | null;

  setUnreadCount: (count: number) => void;
  decrementUnreadCount: (by?: number) => void;
  setPushToken: (token: string | null) => void;
  setPermissionStatus: (status: PermissionStatus) => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  pushToken: null,
  permissionStatus: null,

  setUnreadCount: (count) => set({ unreadCount: Math.max(0, count) }),

  decrementUnreadCount: (by = 1) =>
    set((state) => ({
      unreadCount: Math.max(0, state.unreadCount - by),
    })),

  setPushToken: (token) => set({ pushToken: token }),

  setPermissionStatus: (status) => set({ permissionStatus: status }),

  reset: () =>
    set({
      unreadCount: 0,
      pushToken: null,
      permissionStatus: null,
    }),
}));
