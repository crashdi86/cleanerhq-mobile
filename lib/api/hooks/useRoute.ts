import { useCachedQuery } from "@/hooks/useCachedQuery";
import { useApiMutation } from "@/lib/api/hooks";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/constants/api";
import { queryClient } from "@/lib/api/query-client";
import { showToast } from "@/store/toast-store";
import type {
  TodayRouteResponse,
  OptimizeRouteRequest,
  OptimizeRouteResponse,
} from "@/lib/api/types";
import type { ApiError } from "@/lib/api/client";

/**
 * Fetch today's route with stops, polyline, and summary.
 * Uses offline cache via useCachedQuery.
 */
export function useTodayRoute(date: string) {
  return useCachedQuery<TodayRouteResponse>(
    ["route", date],
    () =>
      apiClient.get<TodayRouteResponse>(
        `${ENDPOINTS.ROUTE_TODAY}?date=${date}`
      ),
    {
      staleTime: 5 * 60_000,
      enabled: !!date,
      entityType: "route",
      cacheKey: `route:${date}`,
    }
  );
}

/**
 * Trigger route optimization (OWNER only).
 * Invalidates route cache on success.
 */
export function useOptimizeRoute() {
  return useApiMutation<OptimizeRouteResponse, OptimizeRouteRequest>(
    (vars) =>
      apiClient.post<OptimizeRouteResponse>(ENDPOINTS.ROUTE_OPTIMIZE, vars),
    {
      onSuccess: () => {
        showToast("success", "Route optimized successfully");
      },
      onError: (error: ApiError) => {
        const code =
          "code" in error ? (error as { code: string }).code : "";
        switch (code) {
          case "INSUFFICIENT_STOPS":
            showToast("error", "Need at least 3 stops to optimize");
            break;
          case "NOT_FOUND":
            showToast("error", "Team member not found");
            break;
          case "INTERNAL_ERROR":
            showToast("error", "Google Maps unavailable. Try again later.");
            break;
          default:
            showToast("error", "Failed to optimize route");
        }
      },
      onSettled: () => {
        void queryClient.invalidateQueries({ queryKey: ["route"] });
      },
    }
  );
}
