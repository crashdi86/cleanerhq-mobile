import { useApiQuery, useApiMutation } from "@/lib/api/hooks";
import { apiClient } from "@/lib/api/client";
import { queryClient } from "@/lib/api/query-client";
import { ENDPOINTS } from "@/constants/api";
import type {
  SOSAlertRequest,
  SOSAlertResponse,
  SOSAlertsResponse,
  SOSAlertStatus,
  SOSAcknowledgeResponse,
  SOSResolveRequest,
  SOSResolveResponse,
} from "@/lib/api/types";

/** Trigger SOS alert — safety-critical, always returns 201 */
export function useTriggerSOS() {
  return useApiMutation<SOSAlertResponse, SOSAlertRequest>((body) =>
    apiClient.post<SOSAlertResponse>(ENDPOINTS.SOS_ALERT, body)
  );
}

/** Fetch SOS alerts for owner dashboard */
export function useSOSAlerts(params?: {
  status?: SOSAlertStatus;
  limit?: number;
  offset?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.offset) searchParams.set("offset", String(params.offset));

  const query = searchParams.toString();
  const url = query ? `${ENDPOINTS.SOS_ALERTS}?${query}` : ENDPOINTS.SOS_ALERTS;

  return useApiQuery<SOSAlertsResponse>(
    ["sos-alerts", params?.status ?? "all", params?.offset ?? 0],
    () => apiClient.get<SOSAlertsResponse>(url),
    {
      staleTime: 15_000,
      refetchInterval: 30_000,
    }
  );
}

/** Acknowledge an active SOS alert (Owner) */
export function useAcknowledgeSOS() {
  return useApiMutation<SOSAcknowledgeResponse, { id: string }>(
    ({ id }) =>
      apiClient.patch<SOSAcknowledgeResponse>(ENDPOINTS.SOS_ACKNOWLEDGE(id)),
    {
      onSettled: () => {
        void queryClient.invalidateQueries({ queryKey: ["sos-alerts"] });
      },
    }
  );
}

/** Resolve an SOS alert with notes (Owner) */
export function useResolveSOS() {
  return useApiMutation<
    SOSResolveResponse,
    { id: string } & SOSResolveRequest
  >(
    ({ id, ...body }) =>
      apiClient.patch<SOSResolveResponse>(ENDPOINTS.SOS_RESOLVE(id), body),
    {
      onSettled: () => {
        void queryClient.invalidateQueries({ queryKey: ["sos-alerts"] });
      },
    }
  );
}
