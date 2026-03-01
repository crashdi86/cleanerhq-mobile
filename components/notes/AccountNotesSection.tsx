import React, { useCallback, useMemo } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faNoteSticky } from "@fortawesome/free-solid-svg-icons";
import { NoteCard } from "./NoteCard";
import { NoteInput } from "./NoteInput";
import {
  useAccountNotes,
  useAddAccountNote,
} from "@/lib/api/hooks/useNotes";
import { showToast } from "@/store/toast-store";
import type { AccountNote } from "@/lib/api/types";

interface AccountNotesSectionProps {
  accountId: string;
}

function EmptyState() {
  return (
    <View className="py-16 items-center justify-center">
      <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-3">
        <FontAwesomeIcon icon={faNoteSticky} size={24} color="#D1D5DB" />
      </View>
      <Text className="text-[15px] text-gray-500 mb-1">
        No account notes yet
      </Text>
      <Text className="text-[13px] text-gray-400">
        Add context about this client
      </Text>
    </View>
  );
}

/**
 * M-06 S4: Account notes section with pagination and pinned note support.
 *
 * - Fetches notes via useInfiniteQuery (20 per page)
 * - Pinned notes displayed first with green styling
 * - Regular notes in created_at desc order
 * - "Load more" button for pagination
 * - Inline input for adding new notes
 */
export function AccountNotesSection({
  accountId,
}: AccountNotesSectionProps) {
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useAccountNotes(accountId);

  const addNoteMutation = useAddAccountNote(accountId);

  // Flatten all pages into a single sorted array
  const allNotes = useMemo(() => {
    if (!data?.pages) return [];
    const flat: AccountNote[] = data.pages.flatMap((page) => page.notes);

    // Separate pinned and regular, then combine
    const pinned = flat.filter((n) => n.is_pinned);
    const regular = flat.filter((n) => !n.is_pinned);

    // Sort each group by created_at descending
    const byDateDesc = (a: AccountNote, b: AccountNote) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

    return [...pinned.sort(byDateDesc), ...regular.sort(byDateDesc)];
  }, [data]);

  const handleSendNote = useCallback(
    (body: string, isPinned?: boolean) => {
      addNoteMutation.mutate(
        { content: body, is_pinned: isPinned },
        {
          onError: () => {
            showToast("error", "Failed to add note");
          },
        }
      );
    },
    [addNoteMutation]
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 120 : 0}
    >
      <View className="px-4 mt-4">
        {/* Notes list */}
        {isLoading ? (
          <View className="py-8 items-center">
            <ActivityIndicator size="small" color="#2A5B4F" />
            <Text className="text-xs text-gray-400 mt-2">
              Loading notes...
            </Text>
          </View>
        ) : allNotes.length === 0 ? (
          <EmptyState />
        ) : (
          <View>
            {allNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                variant={note.is_pinned ? "pinned" : "default"}
              />
            ))}

            {/* Load more */}
            {hasNextPage && (
              <Pressable
                onPress={handleLoadMore}
                className="py-3 items-center"
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <ActivityIndicator size="small" color="#2A5B4F" />
                ) : (
                  <Text className="text-sm font-medium text-[#2A5B4F]">
                    Load more
                  </Text>
                )}
              </Pressable>
            )}
          </View>
        )}

        {/* Note input */}
        <View className="mt-2 mb-4">
          <NoteInput
            onSend={handleSendNote}
            isLoading={addNoteMutation.isPending}
            placeholder="Add an account note..."
            showPinToggle
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
