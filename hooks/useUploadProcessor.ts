import { useEffect } from "react";
import { usePhotoUploadStore } from "@/store/photo-upload-store";
import { useNetworkStore } from "@/store/network-store";
import { processUploadQueue } from "@/lib/photos/upload-service";

/**
 * Hook that watches the upload queue and automatically processes
 * pending items when network is available.
 *
 * Mount once at the app layout level so it persists across screen navigation.
 */
export function useUploadProcessor(): void {
  const queue = usePhotoUploadStore((s) => s.queue);
  const isProcessing = usePhotoUploadStore((s) => s.isProcessing);
  const isConnected = useNetworkStore((s) => s.isConnected);

  // Auto-process when new pending items appear
  useEffect(() => {
    const hasPending = queue.some(
      (p) => p.status === "pending"
    );

    if (hasPending && !isProcessing && isConnected) {
      void processUploadQueue();
    }
  }, [queue, isProcessing, isConnected]);

  // Restore persisted queue on mount
  useEffect(() => {
    void usePhotoUploadStore.getState().restoreQueue();
  }, []);
}
