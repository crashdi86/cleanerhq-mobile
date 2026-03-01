import { useState, useCallback } from "react";
import { useTriggerSOS } from "@/lib/api/hooks/useSOS";
import { useSOSDisclaimer } from "@/hooks/useSOSDisclaimer";
import { useLocation } from "@/hooks/useLocation";
import { ApiError } from "@/lib/api/client";
import { showToast } from "@/store/toast-store";
import { getErrorMessage } from "@/constants/error-messages";

export function useSOSTrigger(jobId: string) {
  const { isAcknowledged, acknowledge } = useSOSDisclaimer();
  const sosMutation = useTriggerSOS();
  const location = useLocation();

  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);

  const triggerSOS = useCallback(() => {
    if (!isAcknowledged) {
      setShowDisclaimer(true);
    } else {
      setShowCountdown(true);
    }
  }, [isAcknowledged]);

  const dismissDisclaimer = useCallback(async () => {
    await acknowledge();
    setShowDisclaimer(false);
    // After acknowledging, proceed to countdown
    setShowCountdown(true);
  }, [acknowledge]);

  const cancelCountdown = useCallback(() => {
    setShowCountdown(false);
  }, []);

  const handleCountdownComplete = useCallback(async () => {
    // Acquire GPS in background — send alert even if GPS fails
    try {
      const coords = await location.acquire();
      await sosMutation.mutateAsync({
        latitude: coords?.latitude ?? 0,
        longitude: coords?.longitude ?? 0,
        job_id: jobId,
      });
      // NO visible confirmation — silent return for safety
    } catch (err) {
      if (err instanceof ApiError && err.code === "SOS_DISABLED") {
        showToast("error", getErrorMessage("SOS_DISABLED"));
      }
      // For all other errors, fail silently (safety-critical)
    }
  }, [jobId, location, sosMutation]);

  return {
    triggerSOS,
    showDisclaimer,
    showCountdown,
    dismissDisclaimer,
    cancelCountdown,
    handleCountdownComplete,
  };
}
