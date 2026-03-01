import { useCallback } from "react";
import { router } from "expo-router";
import { TokenManager } from "@/lib/auth/token-manager";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/constants/api";
import { useAuthStore } from "@/store/auth-store";
import { queryClient } from "@/lib/api/query-client";
import { cacheStorage } from "@/lib/offline";
import { useSyncStore } from "@/store/sync-store";
import { pushTokenStorage } from "@/lib/push/push-token-storage";
import { useNotificationStore } from "@/store/notification-store";

export function useLogout() {
  return useCallback(async () => {
    // 1. Best-effort server logout
    try {
      await apiClient.post(ENDPOINTS.LOGOUT);
    } catch {
      // Ignore — we clear locally regardless
    }

    // 2. Clear tokens and stop proactive refresh
    await TokenManager.logout();

    // 3. Clear React Query cache
    queryClient.clear();

    // 4. Clear offline cache storage
    await cacheStorage.clear();

    // 5. Clear sync state
    useSyncStore.getState().reset();

    // 5.5 Clear push notification token and state
    await pushTokenStorage.clearToken();
    useNotificationStore.getState().reset();

    // 6. Reset Zustand auth store
    useAuthStore.getState().logout();

    // 7. Navigate to login (replace prevents back navigation)
    router.replace("/(auth)/login");
  }, []);
}
