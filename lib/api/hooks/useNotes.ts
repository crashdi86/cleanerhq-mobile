import { useInfiniteQuery } from "@tanstack/react-query";
import { useApiQuery, useApiMutation } from "@/lib/api/hooks";
import { useCachedQuery } from "@/hooks/useCachedQuery";
import { apiClient, type ApiError } from "@/lib/api/client";
import { queryClient } from "@/lib/api/query-client";
import { ENDPOINTS } from "@/constants/api";
import { useAuthStore } from "@/store/auth-store";
import type {
  JobNote,
  AccountNote,
  AddNoteRequest,
  AddAccountNoteRequest,
  AccountDetail,
} from "@/lib/api/types";

// ── Job Notes ──

/** Fetch all notes for a job */
export function useJobNotes(jobId: string) {
  return useApiQuery<JobNote[]>(
    ["job-notes", jobId],
    () => apiClient.get<JobNote[]>(ENDPOINTS.JOB_NOTES(jobId)),
    {
      staleTime: 30_000,
      enabled: !!jobId,
    }
  );
}

/** Add a note to a job with optimistic insert */
export function useAddJobNote(jobId: string) {
  const user = useAuthStore((s) => s.user);

  return useApiMutation<JobNote, AddNoteRequest>(
    (body) => apiClient.post<JobNote>(ENDPOINTS.JOB_NOTES(jobId), body),
    {
      onMutate: async (newNote) => {
        await queryClient.cancelQueries({ queryKey: ["job-notes", jobId] });

        const previous = queryClient.getQueryData<JobNote[]>([
          "job-notes",
          jobId,
        ]);

        // Create optimistic note with temp ID
        const tempNote: JobNote = {
          id: `temp-${Date.now()}`,
          body: newNote.body,
          author_id: user?.id ?? "",
          author_name: user?.fullName ?? "You",
          author_avatar_url: user?.avatarUrl ?? null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        queryClient.setQueryData<JobNote[]>(
          ["job-notes", jobId],
          (old) => [...(old ?? []), tempNote]
        );

        return { previous };
      },
      onError: (_err: ApiError, _vars: AddNoteRequest, context: unknown) => {
        const ctx = context as { previous?: JobNote[] } | undefined;
        if (ctx?.previous) {
          queryClient.setQueryData(["job-notes", jobId], ctx.previous);
        }
      },
      onSettled: () => {
        void queryClient.invalidateQueries({ queryKey: ["job-notes", jobId] });
      },
    }
  );
}

// ── Account Detail ──

/** Fetch account detail by ID (with offline cache) */
export function useAccountDetail(accountId: string) {
  return useCachedQuery<AccountDetail>(
    ["account", accountId],
    () =>
      apiClient.get<AccountDetail>(ENDPOINTS.ACCOUNT_DETAIL(accountId)),
    {
      staleTime: 60_000,
      enabled: !!accountId,
      entityType: "account",
      cacheKey: `account:${accountId}`,
    }
  );
}

// ── Account Notes ──

interface AccountNotesPage {
  notes: AccountNote[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/** Fetch paginated account notes with infinite query */
export function useAccountNotes(accountId: string) {
  return useInfiniteQuery<AccountNotesPage, ApiError>({
    queryKey: ["account-notes", accountId],
    queryFn: ({ pageParam }) => {
      const offset = pageParam as number;
      return apiClient.get<AccountNotesPage>(
        `${ENDPOINTS.ACCOUNT_NOTES(accountId)}?limit=20&offset=${offset}`
      );
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination.hasMore) return undefined;
      return lastPage.pagination.offset + lastPage.pagination.limit;
    },
    staleTime: 30_000,
    enabled: !!accountId,
  });
}

/** Add a note to an account with optimistic insert */
export function useAddAccountNote(accountId: string) {
  const user = useAuthStore((s) => s.user);

  return useApiMutation<AccountNote, AddAccountNoteRequest>(
    (body) =>
      apiClient.post<AccountNote>(ENDPOINTS.ACCOUNT_NOTES(accountId), body),
    {
      onMutate: async (newNote) => {
        await queryClient.cancelQueries({
          queryKey: ["account-notes", accountId],
        });

        const previous = queryClient.getQueryData([
          "account-notes",
          accountId,
        ]);

        // Optimistically add to first page
        const tempNote: AccountNote = {
          id: `temp-${Date.now()}`,
          content: newNote.content,
          is_pinned: newNote.is_pinned ?? false,
          author_id: user?.id ?? "",
          author_email: user?.email ?? "",
          created_at: new Date().toISOString(),
        };

        queryClient.setQueryData<{
          pages: AccountNotesPage[];
          pageParams: number[];
        }>(["account-notes", accountId], (old) => {
          if (!old) return old;
          const newPages = [...old.pages];
          const firstPage = newPages[0];
          if (newPages.length > 0 && firstPage) {
            newPages[0] = {
              ...firstPage,
              notes: [tempNote, ...firstPage.notes],
            };
          }
          return { ...old, pages: newPages };
        });

        return { previous };
      },
      onError: (
        _err: ApiError,
        _vars: AddAccountNoteRequest,
        context: unknown,
      ) => {
        const ctx = context as { previous?: unknown } | undefined;
        if (ctx?.previous) {
          queryClient.setQueryData(
            ["account-notes", accountId],
            ctx.previous
          );
        }
      },
      onSettled: () => {
        void queryClient.invalidateQueries({
          queryKey: ["account-notes", accountId],
        });
      },
    }
  );
}
