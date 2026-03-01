import React, { useCallback } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faNoteSticky } from "@fortawesome/free-solid-svg-icons";
import { NoteCard } from "@/components/notes/NoteCard";
import { NoteInput } from "@/components/notes/NoteInput";
import { useJobNotes, useAddJobNote } from "@/lib/api/hooks/useNotes";
import { showToast } from "@/store/toast-store";

interface NotesTabProps {
  jobId: string;
}

function EmptyState() {
  return (
    <View className="py-16 items-center justify-center">
      <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-3">
        <FontAwesomeIcon icon={faNoteSticky} size={24} color="#D1D5DB" />
      </View>
      <Text className="text-[15px] text-gray-500 mb-1">No notes yet</Text>
      <Text className="text-[13px] text-gray-400">
        Add the first note to document this job
      </Text>
    </View>
  );
}

function LoadingSkeleton() {
  return (
    <View className="py-8 items-center justify-center">
      <ActivityIndicator size="small" color="#2A5B4F" />
      <Text className="text-xs text-gray-400 mt-2">Loading notes...</Text>
    </View>
  );
}

/**
 * M-06 S1+S2: Interactive job notes tab with chat-style display and inline input.
 *
 * - Fetches notes from GET /jobs/{id}/notes
 * - Displays in chronological order (oldest first, newest at bottom)
 * - Inline note input with optimistic insert
 * - Markdown-lite rendering, expand/collapse, author attribution
 */
export function NotesTab({ jobId }: NotesTabProps) {
  const { data: notes, isLoading } = useJobNotes(jobId);
  const addNoteMutation = useAddJobNote(jobId);

  const handleSendNote = useCallback(
    (body: string) => {
      addNoteMutation.mutate(
        { body },
        {
          onError: () => {
            showToast("error", "Failed to add note");
          },
        }
      );
    },
    [addNoteMutation]
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 120 : 0}
    >
      <View className="mx-4 mt-4">
        {/* Notes list */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : !notes || notes.length === 0 ? (
          <EmptyState />
        ) : (
          <View>
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </View>
        )}

        {/* Note input */}
        <View className="mt-2 mb-4">
          <NoteInput
            onSend={handleSendNote}
            isLoading={addNoteMutation.isPending}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
