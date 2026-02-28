import { TokenManager } from "./token-manager";
import { API_BASE_URL, ENDPOINTS } from "@/constants/api";
import { useAuthStore } from "@/store/auth-store";
import { queryClient } from "@/lib/api/query-client";
import type { RefreshResponse } from "@/lib/api/types";

let configured = false;

/**
 * Wire up TokenManager with the actual refresh API call and logout handler.
 * Must be called once during app init (idempotent).
 *
 * CRITICAL: Uses raw fetch (NOT apiClient) for the refresh call to avoid
 * infinite loop — apiClient's 401 handler calls TokenManager.refresh(),
 * so the refresh call itself must bypass the client interceptor.
 */
export function configureAuth(): void {
  if (configured) return;

  TokenManager.configure(
    async (refreshToken: string) => {
      const res = await fetch(`${API_BASE_URL}${ENDPOINTS.REFRESH}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!res.ok) {
        throw new Error("Refresh failed");
      }

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error?.message ?? "Refresh failed");
      }

      return json.data as RefreshResponse;
    },
    () => {
      useAuthStore.getState().logout();
      queryClient.clear();
    }
  );

  configured = true;
}
