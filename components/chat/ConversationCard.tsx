import { View, Text, Pressable } from "@/tw";
import { StyleSheet } from "react-native";
import { cn } from "@/lib/utils";
import { AvatarCircle } from "./AvatarCircle";
import { ConversationTypeBadge } from "./ConversationTypeBadge";
import type { Conversation } from "@/lib/api/types";

interface ConversationCardProps {
  conversation: Conversation;
  onPress: (id: string) => void;
}

/** Conversation list item — avatar, title, preview, timestamp, unread badge */
export function ConversationCard({
  conversation,
  onPress,
}: ConversationCardProps) {
  const {
    id,
    title,
    type,
    last_message_preview,
    last_message_at,
    unread_count,
    participants,
    job,
  } = conversation;

  const hasUnread = unread_count > 0;
  const firstParticipant = participants[0];
  const avatarName = firstParticipant?.name ?? title;
  const avatarUrl = firstParticipant?.avatar_url ?? null;
  const preview =
    last_message_preview.length > 80
      ? `${last_message_preview.slice(0, 80)}...`
      : last_message_preview;

  return (
    <Pressable
      onPress={() => onPress(id)}
      className={cn(
        "bg-white rounded-[16px] px-4 py-3 flex-row items-center",
        hasUnread && "bg-primary/[0.03]",
      )}
      style={styles.card}
    >
      {/* Avatar */}
      <AvatarCircle name={avatarName} avatarUrl={avatarUrl} size={48} />

      {/* Content */}
      <View className="flex-1 ml-3 mr-2">
        {/* Title row */}
        <View className="flex-row items-center justify-between mb-0.5">
          <Text
            className={cn(
              "text-sm flex-1 mr-2",
              hasUnread ? "font-bold text-gray-900" : "font-semibold text-gray-800",
            )}
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text className="text-[11px] text-gray-400">
            {formatRelativeTime(last_message_at)}
          </Text>
        </View>

        {/* Preview */}
        <Text
          className={cn(
            "text-[13px] mb-1",
            hasUnread ? "font-medium text-gray-700" : "text-gray-500",
          )}
          numberOfLines={1}
        >
          {preview || "No messages yet"}
        </Text>

        {/* Bottom row: type badge + unread badge */}
        <View className="flex-row items-center justify-between">
          <ConversationTypeBadge
            type={type}
            jobNumber={job?.job_number}
          />
          {hasUnread && (
            <View style={styles.unreadBadge}>
              <Text className="text-white text-[11px] font-bold">
                {unread_count > 99 ? "99+" : unread_count}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

function formatRelativeTime(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHrs = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHrs < 24) return `${diffHrs}h`;
  if (diffDays < 7) return `${diffDays}d`;

  const d = new Date(isoDate);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

const styles = StyleSheet.create({
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  unreadBadge: {
    backgroundColor: "#EF4444",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
});
