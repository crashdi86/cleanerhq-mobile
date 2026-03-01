import { useCallback } from "react";
import { useNetworkStore } from "@/store/network-store";
import { useMutationQueueStore } from "@/store/mutation-queue-store";
import { useAuthStore } from "@/store/auth-store";
import { queryClient } from "@/lib/api/query-client";
import { ENDPOINTS } from "@/constants/api";
import { CHAT_KEYS } from "@/lib/api/hooks/useChat";
import { useSendMessage } from "@/lib/api/hooks/useChat";
import type {
  ChatMessage,
  MessagesPage,
  MessageVisibility,
} from "@/lib/api/types";

/**
 * M-12 S6: Offline-aware message sending.
 *
 * - Online: delegates to useSendMessage (optimistic + server call)
 * - Offline: enqueues in mutation queue, inserts optimistic "queued" message
 *
 * The mutation queue processor (already mounted in _layout.tsx) will
 * send queued messages when connectivity is restored.
 */
export function useChatOfflineSend(conversationId: string) {
  const sendMessage = useSendMessage(conversationId);
  const isConnected = useNetworkStore((s) => s.isConnected);
  const isInternetReachable = useNetworkStore((s) => s.isInternetReachable);
  const enqueue = useMutationQueueStore((s) => s.enqueue);
  const user = useAuthStore((s) => s.user);

  const isOnline = isConnected && isInternetReachable !== false;

  const send = useCallback(
    (content: string, visibility: MessageVisibility) => {
      if (isOnline) {
        // Online: use the standard optimistic mutation
        sendMessage.mutate({
          content,
          visibility_mode: visibility,
        });
      } else {
        // Offline: enqueue for later + optimistic insert
        const tempId = `queued-${Date.now()}`;

        enqueue({
          entityType: "chat_message",
          entityId: tempId,
          method: "POST",
          endpoint: ENDPOINTS.CHAT_SEND(conversationId),
          payload: JSON.stringify({
            content,
            visibility_mode: visibility,
          }),
          description: `Send message in conversation`,
        });

        // Insert optimistic queued message into cache
        const tempMessage: ChatMessage = {
          id: tempId,
          content,
          sequence_number: Date.now(),
          sender_id: user?.id ?? "",
          sender_name: user?.fullName ?? "You",
          sender_avatar_url: null,
          visibility_mode: visibility,
          created_at: new Date().toISOString(),
        };

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
      }
    },
    [isOnline, sendMessage, enqueue, conversationId, user],
  );

  return {
    send,
    isPending: sendMessage.isPending,
    isOffline: !isOnline,
  };
}
