import { useState, useRef, useCallback } from "react";
import { View, Text, Pressable } from "@/tw";
import {
  TextInput,
  StyleSheet,
  type TextInput as RNTextInput,
} from "react-native";
import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faLock,
  faGlobe,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import type { MessageVisibility } from "@/lib/api/types";

interface MessageInputBarProps {
  onSend: (content: string, visibility: MessageVisibility) => void;
  isLoading: boolean;
  isOffline?: boolean;
}

/** Chat input bar — visibility toggle + multiline input + send button */
export function MessageInputBar({
  onSend,
  isLoading,
  isOffline,
}: MessageInputBarProps) {
  const [text, setText] = useState("");
  const [visibility, setVisibility] = useState<MessageVisibility>("public");
  const inputRef = useRef<RNTextInput>(null);

  const canSend = text.trim().length > 0 && !isLoading;

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed, visibility);
    setText("");
    // Keep keyboard open after send
  }, [text, visibility, onSend]);

  const toggleVisibility = useCallback(() => {
    setVisibility((v) => (v === "public" ? "private" : "public"));
  }, []);

  const isPrivate = visibility === "private";

  return (
    <View style={styles.container}>
      {/* Offline indicator */}
      {isOffline && (
        <Text className="text-[11px] text-gray-400 text-center px-4 pb-1">
          Messages will be sent when you're back online
        </Text>
      )}

      <View className="flex-row items-end px-3 py-2 gap-2">
        {/* Visibility toggle */}
        <Pressable
          onPress={toggleVisibility}
          className={cn(
            "w-9 h-9 rounded-full items-center justify-center mb-0.5",
            isPrivate ? "bg-warning/15" : "bg-gray-100",
          )}
          hitSlop={8}
        >
          <FontAwesomeIcon
            icon={isPrivate ? faLock : faGlobe}
            size={14}
            color={isPrivate ? "#F59E0B" : "#9CA3AF"}
          />
        </Pressable>

        {/* Text input */}
        <View
          className={cn(
            "flex-1 rounded-2xl px-3.5 py-2 min-h-[38px] max-h-[120px]",
            isPrivate ? "bg-warning/5" : "bg-gray-100",
          )}
          style={isPrivate ? styles.privateInputBorder : undefined}
        >
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            placeholder={
              isPrivate ? "Team-only message..." : "Type a message..."
            }
            placeholderTextColor="#9CA3AF"
            multiline
            style={styles.input}
            returnKeyType="default"
            blurOnSubmit={false}
          />
        </View>

        {/* Send button */}
        <Pressable
          onPress={handleSend}
          disabled={!canSend}
          className={cn(
            "w-9 h-9 rounded-full items-center justify-center mb-0.5",
            canSend ? "bg-primary" : "bg-gray-200",
          )}
          hitSlop={8}
        >
          <FontAwesomeIcon
            icon={faPaperPlane}
            size={14}
            color={canSend ? "#FFFFFF" : "#9CA3AF"}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  input: {
    fontSize: 15,
    color: "#1F2937",
    lineHeight: 20,
    paddingTop: 0,
    paddingBottom: 0,
    fontFamily: "PlusJakartaSans",
  },
  privateInputBorder: {
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.25)",
  },
});
