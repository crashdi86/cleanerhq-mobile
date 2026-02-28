import { useApiQuery, useApiMutation } from "@/lib/api/hooks";
import { apiClient } from "@/lib/api/client";
import { queryClient } from "@/lib/api/query-client";
import { ENDPOINTS } from "@/constants/api";
import type {
  JobDetail,
  JobStartRequest,
  JobCompleteRequest,
  JobStatusUpdateRequest,
} from "@/lib/api/types";

/** Fetch full job detail by ID */
export function useJobDetail(id: string) {
  return useApiQuery<JobDetail>(
    ["job", id],
    () => apiClient.get<JobDetail>(ENDPOINTS.JOB_DETAIL(id)),
    {
      staleTime: 60_000,
      enabled: !!id,
    }
  );
}

/** Start a job (scheduled → in_progress) with geolocation */
export function useStartJob() {
  return useApiMutation<JobDetail, { id: string } & JobStartRequest>(
    (vars) => {
      const { id, ...body } = vars;
      return apiClient.post<JobDetail>(ENDPOINTS.JOB_START(id), body);
    },
    {
      onMutate: async (vars) => {
        await queryClient.cancelQueries({ queryKey: ["job", vars.id] });
        const previous = queryClient.getQueryData<JobDetail>(["job", vars.id]);
        queryClient.setQueryData<JobDetail>(["job", vars.id], (old) =>
          old ? { ...old, status: "in_progress" } : undefined
        );
        return { previous };
      },
      onError: (_err, vars, context) => {
        const ctx = context as { previous?: JobDetail } | undefined;
        if (ctx?.previous) {
          queryClient.setQueryData(["job", vars.id], ctx.previous);
        }
      },
      onSettled: (_data, _error, vars) => {
        void queryClient.invalidateQueries({ queryKey: ["job", vars.id] });
        void queryClient.invalidateQueries({ queryKey: ["my-schedule"] });
        void queryClient.invalidateQueries({ queryKey: ["time-status"] });
      },
    }
  );
}

/** Complete a job (in_progress → completed) with geolocation */
export function useCompleteJob() {
  return useApiMutation<JobDetail, { id: string } & JobCompleteRequest>(
    (vars) => {
      const { id, ...body } = vars;
      return apiClient.post<JobDetail>(ENDPOINTS.JOB_COMPLETE(id), body);
    },
    {
      onMutate: async (vars) => {
        await queryClient.cancelQueries({ queryKey: ["job", vars.id] });
        const previous = queryClient.getQueryData<JobDetail>(["job", vars.id]);
        queryClient.setQueryData<JobDetail>(["job", vars.id], (old) =>
          old ? { ...old, status: "completed" } : undefined
        );
        return { previous };
      },
      onError: (_err, vars, context) => {
        const ctx = context as { previous?: JobDetail } | undefined;
        if (ctx?.previous) {
          queryClient.setQueryData(["job", vars.id], ctx.previous);
        }
      },
      onSettled: (_data, _error, vars) => {
        void queryClient.invalidateQueries({ queryKey: ["job", vars.id] });
        void queryClient.invalidateQueries({ queryKey: ["my-schedule"] });
        void queryClient.invalidateQueries({ queryKey: ["time-status"] });
      },
    }
  );
}

/** Update job status (generic transition) */
export function useUpdateJobStatus() {
  return useApiMutation<JobDetail, { id: string } & JobStatusUpdateRequest>(
    (vars) => {
      const { id, ...body } = vars;
      return apiClient.patch<JobDetail>(ENDPOINTS.JOB_STATUS(id), body);
    },
    {
      onSettled: (_data, _error, vars) => {
        void queryClient.invalidateQueries({ queryKey: ["job", vars.id] });
        void queryClient.invalidateQueries({ queryKey: ["my-schedule"] });
      },
    }
  );
}
