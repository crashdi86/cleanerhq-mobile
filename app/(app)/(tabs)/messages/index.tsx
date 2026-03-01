import React, { useCallback, useMemo } from "react";
import {
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { View, Text } from "@/tw";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useConversations } from "@/lib/api/hooks/useChat";
import { ConversationCard } from "@/components/chat/ConversationCard";
import { ConversationSkeleton } from "@/components/chat/ConversationSkeleton";
import { EmptyConversations } from "@/components/chat/EmptyConversations";
import type { Conversation } from "@/lib/api/types";

/**
 * M-12 S1: Conversations list screen.
 * Shows all conversations (direct + job) with infinite scroll and pull-to-refresh.
 */
export default function MessagesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useConversations();

  // Flatten all pages into a single array
  const conversations = useMemo<Conversation[]>(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data);
  }, [data]);

  const handleConversationPress = useCallback(
    (conversationId: string) => {
      router.push(`/(app)/chat/${conversationId}` as never);
    },
    [router],
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderConversation = useCallback(
    ({ item }: { item: Conversation }) => (
      <ConversationCard
        conversation={item}
        onPress={handleConversationPress}
      />
    ),
    [handleConversationPress],
  );

  const keyExtractor = useCallback((item: Conversation) => item.id, []);

  return (
    <View className="flex-1 bg-[#F8FAF9]">
      {/* Header */}
      <View
        className="bg-white border-b border-gray-100 px-5 pb-3"
        style={{ paddingTop: insets.top + 12 }}
      >
        <Text className="text-2xl font-bold text-gray-900">Messages</Text>
      </View>

      {/* Content */}
      {isLoading ? (
        <ConversationSkeleton />
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={keyExtractor}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          contentContainerStyle={[
            styles.listContent,
            conversations.length === 0 && styles.emptyContainer,
          ]}
          ItemSeparatorComponent={() => <View className="h-2" />}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching && !isFetchingNextPage}
              onRefresh={() => void refetch()}
              tintColor="#2A5B4F"
              colors={["#2A5B4F"]}
            />
          }
          ListEmptyComponent={<EmptyConversations />}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#2A5B4F" />
              </View>
            ) : (
              <View style={{ height: insets.bottom + 100 }} />
            )
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
});
