import { useInfiniteQuery } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/api/hooks";
import { apiClient, type ApiError } from "@/lib/api/client";
import { queryClient } from "@/lib/api/query-client";
import { ENDPOINTS } from "@/constants/api";
import { useAuthStore } from "@/store/auth-store";
import { useChatStore } from "@/store/chat-store";
import { cacheStorage } from "@/lib/offline";
import type {
  Conversation,
  ConversationType,
  ChatMessage,
  MessagesPage,
  SendMessageRequest,
  SendMessageResponse,
  MarkReadRequest,
} from "@/lib/api/types";

// ── Query Key Constants ──

export const CHAT_KEYS = {
  conversations: ["chat-conversations"] as const,
  messages: (id: string) => ["chat-messages", id] as const,
};

// ── Paginated Conversations Response ──

interface ConversationsPage {
  data: Conversation[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// ── Offline Cache Helpers ──

const CONVERSATIONS_CACHE_KEY = "chat:conversations:first-page";

function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes("network") ||
      msg.includes("fetch") ||
      msg.includes("timeout") ||
      msg.includes("abort") ||
      msg.includes("econnrefused")
    ) {
      return true;
    }
  }
  return false;
}

async function cacheConversationsPage(
  page: ConversationsPage,
  offset: number,
): Promise<void> {
  if (offset !== 0) return;
  try {
    await cacheStorage.set({
      key: CONVERSATIONS_CACHE_KEY,
      entityType: "chat-conversations",
      data: JSON.stringify(page),
      syncedAt: Date.now(),
    });
  } catch {
    // Cache write failure is non-critical
  }
}

async function readCachedConversationsPage(): Promise<ConversationsPage | null> {
  try {
    const cached = await cacheStorage.get(CONVERSATIONS_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached.data) as ConversationsPage;
    }
  } catch {
    // Cache read failure is non-critical
  }
  return null;
}

async function cacheMessagesPage(
  conversationId: string,
  page: MessagesPage,
  isFirstPage: boolean,
): Promise<void> {
  if (!isFirstPage) return;
  try {
    await cacheStorage.set({
      key: `chat:messages:${conversationId}`,
      entityType: "chat-messages",
      data: JSON.stringify(page),
      syncedAt: Date.now(),
    });
  } catch {
    // Cache write failure is non-critical
  }
}

async function readCachedMessagesPage(
  conversationId: string,
): Promise<MessagesPage | null> {
  try {
    const cached = await cacheStorage.get(`chat:messages:${conversationId}`);
    if (cached) {
      return JSON.parse(cached.data) as MessagesPage;
    }
  } catch {
    // Cache read failure is non-critical
  }
  return null;
}

// ── S1: Conversations List ──

/** Paginated conversations list with offline cache fallback */
export function useConversations(
  typeFilter?: ConversationType,
  options?: { refetchInterval?: number | false },
) {
  return useInfiniteQuery<ConversationsPage, ApiError>({
    queryKey: [...CHAT_KEYS.conversations, typeFilter ?? "all"],
    queryFn: async ({ pageParam }) => {
      const offset = pageParam as number;
      const params = new URLSearchParams();
      params.set("limit", "20");
      params.set("offset", String(offset));
      if (typeFilter) params.set("type", typeFilter);

      try {
        const result = await apiClient.get<ConversationsPage>(
          `${ENDPOINTS.CHAT_CONVERSATIONS}?${params.toString()}`
        );
        // Cache first page for offline access
        void cacheConversationsPage(result, offset);
        return result;
      } catch (error) {
        // On network error for first page, try cache fallback
        if (offset === 0 && isNetworkError(error)) {
          const cached = await readCachedConversationsPage();
          if (cached) return cached;
        }
        throw error;
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination.hasMore) return undefined;
      return lastPage.pagination.offset + lastPage.pagination.limit;
    },
    staleTime: 30_000,
    refetchInterval: options?.refetchInterval ?? 15_000,
  });
}

// ── S2: Chat Thread Messages ──

/** Cursor-paginated messages with offline cache fallback */
export function useMessages(
  conversationId: string,
  options?: { enabled?: boolean; refetchInterval?: number | false },
) {
  return useInfiniteQuery<MessagesPage, ApiError>({
    queryKey: CHAT_KEYS.messages(conversationId),
    queryFn: async ({ pageParam }) => {
      const cursor = pageParam as number | undefined;
      const isFirstPage = cursor === undefined;
      const params = new URLSearchParams();
      params.set("limit", "50");
      if (cursor !== undefined) {
        params.set("before", String(cursor));
      }

      try {
        const result = await apiClient.get<MessagesPage>(
          `${ENDPOINTS.CHAT_MESSAGES(conversationId)}?${params.toString()}`
        );
        // Cache first page for offline access
        void cacheMessagesPage(conversationId, result, isFirstPage);
        // Update newest sequence in store
        if (isFirstPage && result.newest_sequence > 0) {
          useChatStore
            .getState()
            .setNewestSequence(conversationId, result.newest_sequence);
        }
        return result;
      } catch (error) {
        // On network error for first page, try cache fallback
        if (isFirstPage && isNetworkError(error)) {
          const cached = await readCachedMessagesPage(conversationId);
          if (cached) return cached;
        }
        throw error;
      }
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => {
      // "Next page" means older messages (lower sequence numbers)
      if (!lastPage.has_more) return undefined;
      return lastPage.oldest_sequence;
    },
    enabled: !!conversationId && (options?.enabled ?? true),
    staleTime: 0, // Always check for new messages when polling
    refetchInterval: options?.refetchInterval,
  });
}

// ── S3: Send Message ──

/** Send a message with optimistic insert into the messages cache */
export function useSendMessage(conversationId: string) {
  const user = useAuthStore((s) => s.user);

  return useApiMutation<SendMessageResponse, SendMessageRequest>(
    (body) =>
      apiClient.post<SendMessageResponse>(
        ENDPOINTS.CHAT_SEND(conversationId),
        body
      ),
    {
      onMutate: async (newMsg) => {
        // Cancel in-flight queries
        await queryClient.cancelQueries({
          queryKey: CHAT_KEYS.messages(conversationId),
        });

        // Snapshot previous data for rollback
        const previous = queryClient.getQueryData(
          CHAT_KEYS.messages(conversationId)
        );

        // Create optimistic temp message
        const tempMessage: ChatMessage = {
          id: `temp-${Date.now()}`,
          content: newMsg.content,
          sequence_number: Date.now(), // temp high number to sort last
          sender_id: user?.id ?? "",
          sender_name: user?.fullName ?? "You",
          sender_avatar_url: null,
          visibility_mode: newMsg.visibility_mode,
          created_at: new Date().toISOString(),
        };

        // Insert into first page (newest messages)
        queryClient.setQueryData<{
          pages: MessagesPage[];
          pageParams: (number | undefined)[];
        }>(CHAT_KEYS.messages(conversationId), (old) => {
          if (!old) return old;
          const newPages = [...old.pages];
          const firstPage = newPages[0];
          if (newPages.length > 0 && firstPage) {
            newPages[0] = {
              ...firstPage,
              messages: [...firstPage.messages, tempMessage],
              newest_sequence: tempMessage.sequence_number,
            };
          }
          return { ...old, pages: newPages };
        });

        return { previous };
      },
      onError: (
        _err: ApiError,
        _vars: SendMessageRequest,
        context: unknown,
      ) => {
        // Rollback to previous snapshot
        const ctx = context as { previous?: unknown } | undefined;
        if (ctx?.previous) {
          queryClient.setQueryData(
            CHAT_KEYS.messages(conversationId),
            ctx.previous
          );
        }
      },
      onSettled: () => {
        // Refetch to get accurate server state
        void queryClient.invalidateQueries({
          queryKey: CHAT_KEYS.messages(conversationId),
        });
        // Update conversations list (last_message_preview changes)
        void queryClient.invalidateQueries({
          queryKey: CHAT_KEYS.conversations,
        });
      },
    }
  );
}

// ── S5: Mark Conversation Read ──

/** Fire-and-forget mark conversation as read */
export function useMarkConversationRead(conversationId: string) {
  return useApiMutation<unknown, MarkReadRequest>(
    (body) =>
      apiClient.post<unknown>(ENDPOINTS.CHAT_READ(conversationId), body),
    {
      onMutate: async () => {
        // Optimistically set unread_count = 0 for this conversation
        const convKey = [...CHAT_KEYS.conversations, "all"];
        const previous = queryClient.getQueryData(convKey);

        queryClient.setQueryData<{
          pages: ConversationsPage[];
          pageParams: number[];
        }>(convKey, (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((conv) =>
                conv.id === conversationId
                  ? { ...conv, unread_count: 0 }
                  : conv
              ),
            })),
          };
        });

        // Decrement chat store badge
        const conversations = queryClient.getQueryData<{
          pages: ConversationsPage[];
          pageParams: number[];
        }>(convKey);
        const targetConv = conversations?.pages
          .flatMap((p) => p.data)
          .find((c) => c.id === conversationId);
        if (targetConv && targetConv.unread_count > 0) {
          useChatStore
            .getState()
            .decrementTotalUnread(targetConv.unread_count);
        }

        return { previous };
      },
      // Silent error handling — do not show error toasts
      onSettled: () => {
        void queryClient.invalidateQueries({
          queryKey: CHAT_KEYS.conversations,
        });
      },
    }
  );
}
