import { useEffect, useCallback } from "react";
import { useConversations } from "@/lib/api/hooks/useChat";
import { useChatStore } from "@/store/chat-store";
import { useAppForeground } from "@/hooks/useAppForeground";

/**
 * M-12 S5: Syncs chat unread count from conversations → Zustand store.
 * - Sums `unread_count` from all conversations on the first page
 * - Polls via useConversations' built-in refetchInterval (15s)
 * - Refetches on app foreground transition
 *
 * Mount in app/(app)/_layout.tsx alongside useUnreadBadge().
 */
export function useChatUnreadBadge(): void {
  const { data, refetch } = useConversations(undefined, {
    refetchInterval: 30_000, // Badge polling is less urgent than thread polling
  });

  // Sum unread counts from all fetched conversations and sync to store
  useEffect(() => {
    if (!data?.pages) return;
    const totalUnread = data.pages
      .flatMap((page) => page.data)
      .reduce((sum, conv) => sum + conv.unread_count, 0);
    useChatStore.getState().setTotalUnreadCount(totalUnread);
  }, [data]);

  // Refetch on app foreground
  const handleForeground = useCallback(() => {
    void refetch();
  }, [refetch]);

  useAppForeground(handleForeground);
}
