import { useApiQuery } from "../hooks";
import { apiClient } from "../client";
import { ENDPOINTS } from "@/constants/api";
import type { MyScheduleResponse, DashboardSummaryResponse } from "../types";

/** Staff: fetch my schedule for a given date */
export function useMySchedule(date: string) {
  return useApiQuery<MyScheduleResponse>(
    ["my-schedule", date],
    () =>
      apiClient.get<MyScheduleResponse>(
        `${ENDPOINTS.MY_SCHEDULE}?reference_date=${date}`
      ),
    { staleTime: 2 * 60 * 1000 }
  );
}

/** Owner: fetch dashboard KPI summary */
export function useDashboardSummary() {
  return useApiQuery<DashboardSummaryResponse>(
    ["dashboard-summary"],
    () =>
      apiClient.get<DashboardSummaryResponse>(ENDPOINTS.DASHBOARD_SUMMARY),
    { staleTime: 2 * 60 * 1000 }
  );
}

/** Owner: fetch unassigned jobs count */
export function useUnassignedJobs() {
  return useApiQuery<{ jobs: Array<{ id: string; title: string }>; count: number }>(
    ["jobs-unassigned"],
    () =>
      apiClient.get<{ jobs: Array<{ id: string; title: string }>; count: number }>(
        ENDPOINTS.JOBS_UNASSIGNED
      ),
    { staleTime: 5 * 60 * 1000 }
  );
}
