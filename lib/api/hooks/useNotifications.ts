import { useApiQuery, useApiMutation } from "@/lib/api/hooks";
import { apiClient } from "@/lib/api/client";
import { queryClient } from "@/lib/api/query-client";
import { ENDPOINTS } from "@/constants/api";
import type {
  OnMyWayRequest,
  OnMyWayResponse,
  RunningLateRequest,
  RunningLateResponse,
  JobNotificationsResponse,
} from "@/lib/api/types";

/** Send "On My Way" notification to client with GPS-based ETA */
export function useOnMyWay() {
  return useApiMutation<OnMyWayResponse, { id: string } & OnMyWayRequest>(
    ({ id, ...body }) =>
      apiClient.post<OnMyWayResponse>(ENDPOINTS.JOB_ON_MY_WAY(id), body),
    {
      onSettled: (_data, _err, variables) => {
        void queryClient.invalidateQueries({
          queryKey: ["job-notifications", variables.id],
        });
      },
    }
  );
}

/** Send "Running Late" notification with delay and optional reason */
export function useRunningLate() {
  return useApiMutation<
    RunningLateResponse,
    { id: string } & RunningLateRequest
  >(
    ({ id, ...body }) =>
      apiClient.post<RunningLateResponse>(ENDPOINTS.JOB_RUNNING_LATE(id), body),
    {
      onSettled: (_data, _err, variables) => {
        void queryClient.invalidateQueries({
          queryKey: ["job-notifications", variables.id],
        });
      },
    }
  );
}

/** Fetch notification history and can_send state for a job */
export function useJobNotifications(jobId: string) {
  return useApiQuery<JobNotificationsResponse>(
    ["job-notifications", jobId],
    () =>
      apiClient.get<JobNotificationsResponse>(
        ENDPOINTS.JOB_NOTIFICATIONS(jobId)
      ),
    {
      enabled: !!jobId,
      staleTime: 30_000,
    }
  );
}
