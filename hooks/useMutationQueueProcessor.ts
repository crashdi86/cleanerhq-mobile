/**
 * M-07 S5: Auto-processing hook for the mutation queue.
 *
 * Mirrors hooks/useUploadProcessor.ts pattern:
 * - Watches queue + isProcessing + isConnected
 * - Triggers processMutationQueue() when pending items exist and online
 * - Restores persisted queue on mount
 *
 * Mount once at app/(app)/_layout.tsx so it persists across screen navigation.
 */

import { useEffect } from "react";
import { useMutationQueueStore } from "@/store/mutation-queue-store";
import { useNetworkStore } from "@/store/network-store";
import { processMutationQueue } from "@/lib/offline/mutation-processor";

export function useMutationQueueProcessor(): void {
  const queue = useMutationQueueStore((s) => s.queue);
  const isProcessing = useMutationQueueStore((s) => s.isProcessing);
  const isConnected = useNetworkStore((s) => s.isConnected);

  // Auto-process when new pending items appear and online
  useEffect(() => {
    const hasPending = queue.some((m) => m.status === "pending");

    if (hasPending && !isProcessing && isConnected) {
      void processMutationQueue();
    }
  }, [queue, isProcessing, isConnected]);

  // Restore persisted queue on mount
  useEffect(() => {
    void useMutationQueueStore.getState().restoreQueue();
  }, []);
}
