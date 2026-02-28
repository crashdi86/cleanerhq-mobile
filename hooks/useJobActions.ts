import { useMemo, useState, useCallback } from "react";
import * as Haptics from "expo-haptics";
import { useStartJob, useCompleteJob } from "@/lib/api/hooks/useJobDetail";
import { ApiError } from "@/lib/api/client";
import { getActionBarState, type ActionBarState } from "@/lib/job-actions";
import { useClockStore } from "@/store/clock-store";
import { showToast } from "@/store/toast-store";
import { useLocation } from "@/hooks/useLocation";
import { getErrorMessage } from "@/constants/error-messages";
import type { JobDetail } from "@/lib/api/types";

export interface UseJobActionsReturn {
  actionState: ActionBarState;
  handleOnMyWay: () => Promise<void>;
  handleStartJob: () => Promise<void>;
  handleCompleteJob: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useJobActions(
  jobId: string,
  job: JobDetail | undefined
): UseJobActionsReturn {
  const isClockedIn = useClockStore((s) => s.isClockedIn);
  const activeJobId = useClockStore((s) => s.activeJobId);
  const location = useLocation();
  const startJob = useStartJob();
  const completeJob = useCompleteJob();
  const [error, setError] = useState<string | null>(null);

  const actionState = useMemo<ActionBarState>(() => {
    if (!job) {
      return { type: "HIDDEN" };
    }
    return getActionBarState(
      job.status,
      isClockedIn,
      activeJobId,
      jobId,
      job.completion_requirements,
      job.actual_start_timestamp
    );
  }, [job, isClockedIn, activeJobId, jobId]);

  const handleOnMyWay = useCallback(async () => {
    setError(null);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    showToast("success", "Your client has been notified");
  }, []);

  const handleStartJob = useCallback(async () => {
    setError(null);

    try {
      const coords = await location.acquire();
      if (!coords) {
        setError("Unable to acquire location");
        showToast("error", "Unable to acquire location");
        return;
      }

      await startJob.mutateAsync({
        id: jobId,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      showToast("success", "Job started");
    } catch (err) {
      if (err instanceof ApiError) {
        switch (err.code) {
          case "GEOFENCE_VIOLATION":
            showToast("warning", "You must be at the job site");
            break;
          case "INVALID_STATUS_TRANSITION":
            showToast("error", getErrorMessage(err.code));
            break;
          case "JOB_NOT_ASSIGNED":
            showToast("error", getErrorMessage(err.code));
            break;
          default:
            showToast("error", getErrorMessage(err.code, "Failed to start job"));
            break;
        }
        setError(err.message);
      } else {
        showToast("error", "Failed to start job");
        setError("Failed to start job");
      }
    }
  }, [jobId, location, startJob]);

  const handleCompleteJob = useCallback(async () => {
    setError(null);

    try {
      const coords = await location.acquire();
      if (!coords) {
        setError("Unable to acquire location");
        showToast("error", "Unable to acquire location");
        return;
      }

      await completeJob.mutateAsync({
        id: jobId,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      showToast("success", "Job completed!");
    } catch (err) {
      if (err instanceof ApiError) {
        switch (err.code) {
          case "CHECKLIST_INCOMPLETE":
            showToast(
              "warning",
              err.details?.[0]?.message ?? "Complete all checklist items first"
            );
            break;
          case "PHOTOS_REQUIRED":
            showToast(
              "warning",
              err.details?.[0]?.message ?? "More photos required"
            );
            break;
          case "JOB_NOT_STARTED":
            showToast("error", "Job must be started first");
            break;
          default:
            showToast(
              "error",
              getErrorMessage(err.code, "Failed to complete job")
            );
            break;
        }
        setError(err.message);
      } else {
        showToast("error", "Failed to complete job");
        setError("Failed to complete job");
      }
    }
  }, [jobId, location, completeJob]);

  const isLoading =
    startJob.isPending || completeJob.isPending || location.isAcquiring;

  return {
    actionState,
    handleOnMyWay,
    handleStartJob,
    handleCompleteJob,
    isLoading,
    error,
  };
}
