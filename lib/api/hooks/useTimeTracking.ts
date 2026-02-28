import { useApiQuery, useApiMutation } from "../hooks";
import { apiClient } from "../client";
import { queryClient } from "../query-client";
import { ENDPOINTS } from "@/constants/api";
import type {
  TimeStatusResponse,
  ClockInRequest,
  ClockInResponse,
  ClockOutRequest,
  ClockOutResponse,
  TimeEntry,
} from "../types";

/** Get current clock-in status */
export function useTimeStatus(options?: { enabled?: boolean }) {
  return useApiQuery<TimeStatusResponse>(
    ["time-status"],
    () => apiClient.get<TimeStatusResponse>(ENDPOINTS.TIME_STATUS),
    { staleTime: 30 * 1000, ...options }
  );
}

/** Clock in mutation */
export function useClockIn() {
  return useApiMutation<ClockInResponse, ClockInRequest>(
    (vars) => apiClient.post<ClockInResponse>(ENDPOINTS.CLOCK_IN, vars),
    {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ["time-status"] });
        void queryClient.invalidateQueries({ queryKey: ["my-schedule"] });
      },
    }
  );
}

/** Clock out mutation */
export function useClockOut() {
  return useApiMutation<ClockOutResponse, ClockOutRequest>(
    (vars) => apiClient.post<ClockOutResponse>(ENDPOINTS.CLOCK_OUT, vars),
    {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ["time-status"] });
        void queryClient.invalidateQueries({ queryKey: ["my-schedule"] });
        void queryClient.invalidateQueries({ queryKey: ["time-entries"] });
      },
    }
  );
}

/** Fetch time entries for a date range */
export function useTimeEntries(
  dateFrom: string,
  dateTo: string,
  options?: { enabled?: boolean }
) {
  return useApiQuery<TimeEntry[]>(
    ["time-entries", dateFrom, dateTo],
    () =>
      apiClient.get<TimeEntry[]>(
        `${ENDPOINTS.TIME_ENTRIES}?date_from=${dateFrom}&date_to=${dateTo}`
      ),
    options
  );
}
