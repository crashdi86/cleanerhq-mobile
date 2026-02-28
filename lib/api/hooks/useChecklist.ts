import { useApiQuery, useApiMutation } from "@/lib/api/hooks";
import { apiClient, ApiError } from "@/lib/api/client";
import { queryClient } from "@/lib/api/query-client";
import { ENDPOINTS } from "@/constants/api";
import type { JobChecklist, ChecklistItem } from "@/lib/api/types";

/** Fetch checklist for a job */
export function useChecklist(jobId: string) {
  return useApiQuery<JobChecklist>(
    ["checklist", jobId],
    () => apiClient.get<JobChecklist>(ENDPOINTS.JOB_CHECKLIST(jobId)),
    {
      staleTime: 30_000,
      enabled: !!jobId,
    }
  );
}

/** Toggle result type for callers to handle PHOTO_REQUIRED specially */
export interface ToggleResult {
  success: boolean;
  photoRequired?: boolean;
  itemId?: string;
}

interface ToggleVars {
  jobId: string;
  itemId: string;
  completed: boolean;
}

/** Toggle a checklist item with optimistic update */
export function useToggleChecklistItem() {
  return useApiMutation<ChecklistItem, ToggleVars>(
    (vars) =>
      apiClient.patch<ChecklistItem>(
        ENDPOINTS.JOB_CHECKLIST_ITEM(vars.jobId, vars.itemId),
        { completed: vars.completed }
      ),
    {
      onMutate: async (vars) => {
        // Cancel any in-flight checklist queries
        await queryClient.cancelQueries({
          queryKey: ["checklist", vars.jobId],
        });

        // Snapshot previous value
        const previous = queryClient.getQueryData<JobChecklist>([
          "checklist",
          vars.jobId,
        ]);

        // Optimistically update the cache
        queryClient.setQueryData<JobChecklist>(
          ["checklist", vars.jobId],
          (old) => {
            if (!old) return undefined;

            const updatedItems = old.items.map((item) =>
              item.id === vars.itemId
                ? {
                    ...item,
                    completed: vars.completed,
                    completed_at: vars.completed
                      ? new Date().toISOString()
                      : null,
                  }
                : item
            );

            const completed = updatedItems.filter((i) => i.completed).length;
            const total = updatedItems.length;
            const requiredItems = updatedItems.filter((i) => i.required);
            const allRequiredCompleted = requiredItems.every(
              (i) => i.completed
            );

            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

            return {
              ...old,
              items: updatedItems,
              completed,
              total,
              percentage: pct,
              progress: pct,
              allRequiredCompleted,
            };
          }
        );

        return { previous };
      },

      onError: (err, vars, context) => {
        // Rollback optimistic update
        const ctx = context as { previous?: JobChecklist } | undefined;
        if (ctx?.previous) {
          queryClient.setQueryData(
            ["checklist", vars.jobId],
            ctx.previous
          );
        }

        // Re-throw PHOTO_REQUIRED so the caller can handle it
        if (err instanceof ApiError && err.code === "PHOTO_REQUIRED_FOR_ITEM") {
          // Caller handles this — don't toast
          return;
        }
      },

      onSettled: (_data, _error, vars) => {
        // Refetch checklist and job detail (for completion_requirements)
        void queryClient.invalidateQueries({
          queryKey: ["checklist", vars.jobId],
        });
        void queryClient.invalidateQueries({
          queryKey: ["job", vars.jobId],
        });
      },
    }
  );
}

/** Invalidate checklist queries (call after photo upload for checklist item) */
export function invalidateChecklist(jobId: string): void {
  void queryClient.invalidateQueries({ queryKey: ["checklist", jobId] });
  void queryClient.invalidateQueries({ queryKey: ["job", jobId] });
}
