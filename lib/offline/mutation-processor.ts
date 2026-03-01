/**
 * M-07 S5: Sequential FIFO Mutation Processor.
 *
 * Mirrors lib/photos/upload-service.ts pattern:
 * - Dequeue oldest pending → set processing → execute → on success remove → on failure retry
 * - Exponential backoff: min(1000 * 2^retryCount, 16000) + random(0,500)ms
 * - Max 5 retries before marking "failed"
 * - Pauses if offline mid-processing
 */

import { apiClient } from "@/lib/api/client";
import { useMutationQueueStore } from "@/store/mutation-queue-store";
import { useNetworkStore } from "@/store/network-store";
import type { MutationMethod } from "@/store/mutation-queue-store";

const MAX_RETRIES = 5;

function getBackoffMs(retryCount: number): number {
  const base = Math.min(1000 * Math.pow(2, retryCount), 16_000);
  const jitter = Math.random() * 500;
  return base + jitter;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isOnline(): boolean {
  const { isConnected, isInternetReachable } = useNetworkStore.getState();
  return isConnected && isInternetReachable !== false;
}

async function executeApiCall(
  method: MutationMethod,
  endpoint: string,
  payload: string | null
): Promise<void> {
  const parsedBody = payload ? (JSON.parse(payload) as unknown) : undefined;

  switch (method) {
    case "POST":
      await apiClient.post(endpoint, parsedBody);
      break;
    case "PUT":
      await apiClient.put(endpoint, parsedBody);
      break;
    case "PATCH":
      await apiClient.patch(endpoint, parsedBody);
      break;
    case "DELETE":
      await apiClient.delete(endpoint);
      break;
    case "GET":
      await apiClient.get(endpoint);
      break;
  }
}

/**
 * Process the mutation queue sequentially (FIFO).
 * Returns summary of processed and failed counts.
 */
export async function processMutationQueue(): Promise<{
  processed: number;
  failed: number;
}> {
  const store = useMutationQueueStore.getState();

  if (store.isProcessing) {
    return { processed: 0, failed: 0 };
  }

  store.setProcessing(true);

  let processed = 0;
  let failed = 0;

  try {
    // Process items one at a time in FIFO order
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // Check connectivity before each item
      if (!isOnline()) break;

      const next = useMutationQueueStore.getState().dequeue();
      if (!next) break;

      // Mark as processing
      useMutationQueueStore.getState().updateItem(next.id, {
        status: "processing",
      });

      try {
        await executeApiCall(
          next.method,
          next.endpoint,
          next.payload || null
        );

        // Success — remove from queue
        useMutationQueueStore.getState().removeItem(next.id);
        processed++;
      } catch (error) {
        const newRetryCount = next.retryCount + 1;
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        if (newRetryCount >= MAX_RETRIES) {
          // Max retries reached — mark as failed
          useMutationQueueStore.getState().updateItem(next.id, {
            status: "failed",
            retryCount: newRetryCount,
            errorMessage,
          });
          failed++;
        } else {
          // Backoff and retry — set back to pending
          useMutationQueueStore.getState().updateItem(next.id, {
            status: "pending",
            retryCount: newRetryCount,
            errorMessage,
          });

          // Wait before processing the next item (backoff)
          const backoff = getBackoffMs(newRetryCount);
          await sleep(backoff);
        }
      }
    }
  } finally {
    useMutationQueueStore.getState().setProcessing(false);
  }

  return { processed, failed };
}
