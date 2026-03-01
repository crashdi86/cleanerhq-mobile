/**
 * M-07 S5: Offline-aware mutation hook.
 *
 * If online → execute immediately via React Query mutation.
 * If offline → enqueue in mutation queue + apply optimistic update.
 */

import { useCallback } from "react";
import {
  useMutation,
  type UseMutationOptions,
  type QueryKey,
} from "@tanstack/react-query";
import { type ApiError } from "@/lib/api/client";
import { queryClient } from "@/lib/api/query-client";
import { useNetworkStore } from "@/store/network-store";
import {
  useMutationQueueStore,
  type MutationEntityType,
  type MutationMethod,
} from "@/store/mutation-queue-store";

interface OfflineMutationConfig<TData, TVariables> {
  /** The normal online mutation function */
  mutationFn: (variables: TVariables) => Promise<TData>;
  /** Mutation options (onMutate, onError, onSettled, etc.) */
  options?: Omit<
    UseMutationOptions<TData, ApiError, TVariables>,
    "mutationFn"
  >;
  /** Offline queue metadata */
  offline: {
    entityType: MutationEntityType;
    /** Extract entity ID from variables */
    getEntityId: (variables: TVariables) => string;
    /** Build the API method for the queue */
    method: MutationMethod;
    /** Build the endpoint for the queue */
    getEndpoint: (variables: TVariables) => string;
    /** Build the payload for the queue (JSON-stringified body) */
    getPayload: (variables: TVariables) => string;
    /** Human-readable description for UI */
    getDescription: (variables: TVariables) => string;
    /** Query keys to invalidate on offline enqueue (for optimistic updates) */
    invalidateKeys?: QueryKey[];
    /** Apply optimistic update when enqueueing offline */
    onOfflineOptimistic?: (variables: TVariables) => void;
  };
}

export function useOfflineMutation<TData, TVariables>(
  config: OfflineMutationConfig<TData, TVariables>
) {
  const isConnected = useNetworkStore((s) => s.isConnected);
  const isInternetReachable = useNetworkStore((s) => s.isInternetReachable);
  const enqueue = useMutationQueueStore((s) => s.enqueue);

  const isOnline = isConnected && isInternetReachable !== false;

  // The underlying React Query mutation (used when online)
  const mutation = useMutation<TData, ApiError, TVariables>({
    mutationFn: config.mutationFn,
    ...config.options,
  });

  const mutateOfflineAware = useCallback(
    (variables: TVariables) => {
      if (isOnline) {
        // Online: execute immediately via React Query
        mutation.mutate(variables);
      } else {
        // Offline: enqueue for later processing
        enqueue({
          entityType: config.offline.entityType,
          entityId: config.offline.getEntityId(variables),
          method: config.offline.method,
          endpoint: config.offline.getEndpoint(variables),
          payload: config.offline.getPayload(variables),
          description: config.offline.getDescription(variables),
        });

        // Apply optimistic update if defined
        if (config.offline.onOfflineOptimistic) {
          config.offline.onOfflineOptimistic(variables);
        }

        // Invalidate specified query keys (triggers re-render with optimistic data)
        if (config.offline.invalidateKeys) {
          for (const key of config.offline.invalidateKeys) {
            void queryClient.invalidateQueries({ queryKey: key });
          }
        }
      }
    },
    [isOnline, mutation, enqueue, config.offline]
  );

  return {
    ...mutation,
    /** Use this instead of mutation.mutate() for offline-aware behavior */
    mutateOfflineAware,
    /** Whether the mutation would be queued (offline) vs executed immediately */
    isOffline: !isOnline,
  };
}
