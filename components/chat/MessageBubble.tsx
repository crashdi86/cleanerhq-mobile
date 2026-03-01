import { View, Text } from "@/tw";
import { StyleSheet } from "react-native";
import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faLock, faClock } from "@fortawesome/free-solid-svg-icons";
import { AvatarCircle } from "./AvatarCircle";
import type { ChatMessage } from "@/lib/api/types";

interface MessageBubbleProps {
  message: ChatMessage;
  /** Whether this message was sent by the current user */
  isOwn: boolean;
  /** Show sender name + avatar (for first message in a group from other user) */
  showSender: boolean;
}

/** Single chat bubble — own messages right-aligned (primary), others left-aligned (gray) */
export function MessageBubble({
  message,
  isOwn,
  showSender,
}: MessageBubbleProps) {
  const isPrivate = message.visibility_mode === "private";
  const isSending = message.id.startsWith("temp-");

  return (
    <View
      className={cn(
        "px-4 mb-1",
        isOwn ? "items-end" : "items-start",
        showSender && !isOwn && "mt-2",
      )}
    >
      {/* Sender name + avatar (other users only) */}
      {showSender && !isOwn && (
        <View className="flex-row items-center mb-1 ml-1">
          <AvatarCircle
            name={message.sender_name}
            avatarUrl={message.sender_avatar_url}
            size={20}
          />
          <Text className="text-[11px] text-gray-500 font-semibold ml-1.5">
            {message.sender_name}
          </Text>
        </View>
      )}

      {/* Bubble */}
      <View
        className={cn(
          "rounded-2xl px-3.5 py-2.5 max-w-[80%]",
          isOwn ? "rounded-br-md" : "rounded-bl-md",
        )}
        style={[
          isOwn ? styles.ownBubble : styles.otherBubble,
          isPrivate && styles.privateBorder,
        ]}
      >
        {/* Private indicator */}
        {isPrivate && (
          <View className="flex-row items-center mb-1">
            <FontAwesomeIcon icon={faLock} size={10} color={isOwn ? "#B7F0AD" : "#6B7280"} />
            <Text
              className={cn(
                "text-[10px] font-semibold ml-1",
                isOwn ? "text-white/70" : "text-gray-500",
              )}
            >
              Team only
            </Text>
          </View>
        )}

        {/* Message content */}
        <Text
          className={cn(
            "text-[15px] leading-5",
            isOwn ? "text-white" : "text-gray-900",
          )}
        >
          {message.content}
        </Text>

        {/* Timestamp + sending indicator */}
        <View className="flex-row items-center justify-end mt-1 gap-1">
          {isSending && (
            <FontAwesomeIcon icon={faClock} size={10} color={isOwn ? "rgba(255,255,255,0.5)" : "#9CA3AF"} />
          )}
          <Text
            className={cn(
              "text-[10px]",
              isOwn ? "text-white/50" : "text-gray-400",
            )}
          >
            {formatTime(message.created_at)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function formatTime(isoDate: string): string {
  const d = new Date(isoDate);
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

const styles = StyleSheet.create({
  ownBubble: {
    backgroundColor: "#2A5B4F",
  },
  otherBubble: {
    backgroundColor: "#F3F4F6",
  },
  privateBorder: {
    borderLeftWidth: 2,
    borderLeftColor: "#F59E0B",
    borderStyle: "dashed",
  },
});
