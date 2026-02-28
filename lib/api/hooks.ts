import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
  type QueryKey,
} from "@tanstack/react-query";
import { type ApiError } from "./client";

export function useApiQuery<TData>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, ApiError>, "queryKey" | "queryFn">
) {
  return useQuery<TData, ApiError>({
    queryKey,
    queryFn,
    ...options,
  });
}

export function useApiMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<
    UseMutationOptions<TData, ApiError, TVariables>,
    "mutationFn"
  >
) {
  return useMutation<TData, ApiError, TVariables>({
    mutationFn,
    ...options,
  });
}
