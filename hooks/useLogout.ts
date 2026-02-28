import { useCallback } from "react";
import { router } from "expo-router";
import { TokenManager } from "@/lib/auth/token-manager";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/constants/api";
import { useAuthStore } from "@/store/auth-store";
import { queryClient } from "@/lib/api/query-client";

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

    // 4. Reset Zustand auth store
    useAuthStore.getState().logout();

    // 5. Navigate to login (replace prevents back navigation)
    router.replace("/(auth)/login");
  }, []);
}
