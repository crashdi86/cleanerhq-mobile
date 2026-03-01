import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "@/tw";
import { useAuthStore } from "@/store/auth-store";
import { useChatStore } from "@/store/chat-store";
import {
  useMessages,
  useMarkConversationRead,
  useConversations,
} from "@/lib/api/hooks/useChat";
import { useChatPolling } from "@/hooks/useChatPolling";
import { useChatOfflineSend } from "@/hooks/useChatOfflineSend";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { DateSeparator } from "@/components/chat/DateSeparator";
import { MessageInputBar } from "@/components/chat/MessageInputBar";
import { ScrollToBottomFAB } from "@/components/chat/ScrollToBottomFAB";
import { NewMessagesIndicator } from "@/components/chat/NewMessagesIndicator";
import type { ChatMessage, MessageVisibility } from "@/lib/api/types";

// ── List item types for FlatList ──

interface MessageItem {
  type: "message";
  message: ChatMessage;
  isOwn: boolean;
  showSender: boolean;
}

interface DateItem {
  type: "date";
  date: string;
  id: string;
}

type ListItem = MessageItem | DateItem;

/**
 * M-12 S2+S3: Chat thread screen.
 * Displays messages in an inverted FlatList with date separators,
 * input bar with visibility toggle, and smart polling.
 */
export default function ChatThreadScreen() {
  const { conversationId } = useLocalSearchParams<{
    conversationId: string;
  }>();
  const router = useRouter();
  const userId = useAuthStore((s) => s.user?.id);
  const flatListRef = useRef<FlatList<ListItem>>(null);
  const hasMarkedReadRef = useRef(false);

  // ── Scroll state ──
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const prevNewestSeqRef = useRef<number>(0);

  // ── Set active conversation for polling ──
  useEffect(() => {
    useChatStore.getState().setActiveConversation(conversationId);
    return () => {
      useChatStore.getState().setActiveConversation(null);
    };
  }, [conversationId]);

  // ── Smart polling interval ──
  const pollInterval = useChatPolling();

  // ── Data hooks ──
  const {
    data: messagesData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages(conversationId, {
    refetchInterval: pollInterval,
  });

  const { send: sendMessage, isPending: isSending, isOffline } = useChatOfflineSend(conversationId);
  const markRead = useMarkConversationRead(conversationId);

  // ── Conversation metadata (for header) ──
  const { data: convsData } = useConversations();
  const conversation = useMemo(() => {
    if (!convsData?.pages) return null;
    return convsData.pages
      .flatMap((p) => p.data)
      .find((c) => c.id === conversationId) ?? null;
  }, [convsData, conversationId]);

  const title = conversation?.title ?? "Chat";
  const participantCount = conversation?.participants.length ?? 0;

  // ── Transform messages into list items ──
  const listItems = useMemo<ListItem[]>(() => {
    if (!messagesData?.pages) return [];

    // Flatten all pages and sort by sequence ascending
    const allMessages = messagesData.pages
      .flatMap((page) => page.messages)
      .sort((a, b) => a.sequence_number - b.sequence_number);

    // Deduplicate by id (in case poll returned overlapping data)
    const seen = new Set<string>();
    const deduped: ChatMessage[] = [];
    for (const msg of allMessages) {
      if (!seen.has(msg.id)) {
        seen.add(msg.id);
        deduped.push(msg);
      }
    }

    // Build list items with date separators
    const items: ListItem[] = [];
    let lastDateKey = "";

    for (let i = 0; i < deduped.length; i++) {
      const msg = deduped[i];
      if (!msg) continue;

      const msgDate = new Date(msg.created_at);
      const dateKey = `${msgDate.getFullYear()}-${msgDate.getMonth()}-${msgDate.getDate()}`;

      if (dateKey !== lastDateKey) {
        items.push({
          type: "date",
          date: msg.created_at,
          id: `date-${dateKey}`,
        });
        lastDateKey = dateKey;
      }

      const prevMsg = i > 0 ? deduped[i - 1] : null;
      const showSender =
        !prevMsg ||
        prevMsg.sender_id !== msg.sender_id ||
        dateKey !==
          `${new Date(prevMsg.created_at).getFullYear()}-${new Date(prevMsg.created_at).getMonth()}-${new Date(prevMsg.created_at).getDate()}`;

      items.push({
        type: "message",
        message: msg,
        isOwn: msg.sender_id === userId,
        showSender,
      });
    }

    // Reverse for inverted FlatList (newest first)
    return items.reverse();
  }, [messagesData, userId]);

  // ── Auto-mark as read (once per conversation open) ──
  const newestSeq = messagesData?.pages[0]?.newest_sequence;

  useEffect(() => {
    if (!hasMarkedReadRef.current && newestSeq && newestSeq > 0) {
      hasMarkedReadRef.current = true;
      markRead.mutate({ last_read_sequence: newestSeq });
    }
  }, [newestSeq, markRead]);

  // ── New message detection (for indicator when scrolled up) ──
  useEffect(() => {
    if (!newestSeq) return;
    if (prevNewestSeqRef.current > 0 && newestSeq > prevNewestSeqRef.current) {
      const diff = newestSeq - prevNewestSeqRef.current;
      if (!isAtBottom) {
        setNewMessageCount((c) => c + diff);
      }
    }
    prevNewestSeqRef.current = newestSeq;
  }, [newestSeq, isAtBottom]);

  // ── Scroll tracking ──
  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset } = e.nativeEvent;
      // In inverted list, offset 0 = bottom; offset > threshold = scrolled up
      const atBottom = contentOffset.y < 100;
      setIsAtBottom(atBottom);
      if (atBottom) {
        setNewMessageCount(0);
      }
    },
    [],
  );

  // ── Send handler ──
  const handleSend = useCallback(
    (content: string, visibility: MessageVisibility) => {
      sendMessage(content, visibility);
      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    },
    [sendMessage],
  );

  // ── Scroll to bottom ──
  const scrollToBottom = useCallback(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    setNewMessageCount(0);
  }, []);

  // ── Load older messages ──
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ── Render ──
  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === "date") {
        return <DateSeparator date={item.date} />;
      }
      return (
        <MessageBubble
          message={item.message}
          isOwn={item.isOwn}
          showSender={item.showSender}
        />
      );
    },
    [],
  );

  const keyExtractor = useCallback((item: ListItem) => {
    if (item.type === "date") return item.id;
    return item.message.id;
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <ChatHeader
        title={title}
        participantCount={participantCount}
        onBack={() => router.back()}
      />

      {/* Messages */}
      <View className="flex-1 bg-[#F8FAF9]">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#2A5B4F" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={listItems}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            inverted
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View className="py-4 items-center">
                  <ActivityIndicator size="small" color="#2A5B4F" />
                </View>
              ) : null
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.messagesList}
          />
        )}

        {/* New messages indicator (when scrolled up) */}
        <NewMessagesIndicator
          count={newMessageCount}
          onPress={scrollToBottom}
        />

        {/* Scroll to bottom FAB */}
        <ScrollToBottomFAB
          visible={!isAtBottom && newMessageCount === 0}
          onPress={scrollToBottom}
          hasNewMessages={false}
        />
      </View>

      {/* Input */}
      <MessageInputBar
        onSend={handleSend}
        isLoading={isSending}
        isOffline={isOffline}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  messagesList: {
    paddingVertical: 8,
  },
});
