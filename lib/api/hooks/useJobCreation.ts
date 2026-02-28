import { useApiQuery, useApiMutation } from "@/lib/api/hooks";
import { apiClient } from "@/lib/api/client";
import { queryClient } from "@/lib/api/query-client";
import { ENDPOINTS } from "@/constants/api";
import type {
  JobDetail,
  CreateJobRequest,
  AccountListItem,
  TeamMember,
} from "@/lib/api/types";

/** Search accounts by name (debounced externally) */
export function useAccountSearch(searchTerm: string) {
  return useApiQuery<AccountListItem[]>(
    ["accounts", searchTerm],
    () =>
      apiClient.get<AccountListItem[]>(
        `${ENDPOINTS.ACCOUNTS}?search=${encodeURIComponent(searchTerm)}`
      ),
    {
      enabled: searchTerm.length >= 2,
      staleTime: 30_000,
    }
  );
}

/** Fetch all workspace team members */
export function useTeamMembers() {
  return useApiQuery<TeamMember[]>(
    ["team"],
    () => apiClient.get<TeamMember[]>(ENDPOINTS.TEAM),
    {
      staleTime: 5 * 60_000,
    }
  );
}

/** Create a new job (Owner only) */
export function useCreateJob() {
  return useApiMutation<JobDetail, CreateJobRequest>(
    (body) => apiClient.post<JobDetail>(ENDPOINTS.JOBS, body),
    {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ["my-schedule"] });
        void queryClient.invalidateQueries({ queryKey: ["jobs-unassigned"] });
        void queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      },
    }
  );
}
