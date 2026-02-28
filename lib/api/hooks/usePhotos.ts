import { useApiQuery } from "@/lib/api/hooks";
import { apiClient } from "@/lib/api/client";
import { queryClient } from "@/lib/api/query-client";
import { ENDPOINTS } from "@/constants/api";
import type { JobPhoto, PhotoCategory } from "@/lib/api/types";

/** Fetch photos for a job, optionally filtered by category */
export function useJobPhotos(jobId: string, category?: PhotoCategory) {
  const params = category ? `?category=${category}` : "";
  return useApiQuery<JobPhoto[]>(
    ["job-photos", jobId, category ?? "all"],
    () => apiClient.get<JobPhoto[]>(`${ENDPOINTS.JOB_PHOTOS(jobId)}${params}`),
    {
      staleTime: 30_000,
      enabled: !!jobId,
    }
  );
}

/** Invalidate photo queries and job detail after a successful upload */
export function invalidateJobPhotos(jobId: string): void {
  void queryClient.invalidateQueries({ queryKey: ["job-photos", jobId] });
  void queryClient.invalidateQueries({ queryKey: ["job", jobId] });
}
