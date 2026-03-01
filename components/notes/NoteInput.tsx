import React, { useState, useCallback, useRef } from "react";
import {
  TextInput,
  StyleSheet,
  type NativeSyntheticEvent,
  type TextInputContentSizeChangeEventData,
} from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPaperPlane, faThumbtack } from "@fortawesome/free-solid-svg-icons";
import * as Haptics from "expo-haptics";

interface NoteInputProps {
  onSend: (body: string, isPinned?: boolean) => void;
  maxLength?: number;
  isLoading?: boolean;
  placeholder?: string;
  /** Show a thumbtack toggle for pinning notes (account notes only) */
  showPinToggle?: boolean;
}

const DEFAULT_MAX_LENGTH = 5000;
const COUNTER_THRESHOLD = 4500;
const MIN_INPUT_HEIGHT = 40;
const MAX_INPUT_HEIGHT = 100; // ~4 lines

/**
 * Auto-growing multiline text input with send button and character counter.
 * Used for both job notes and account notes.
 * Optionally shows a pin toggle for account notes.
 */
export function NoteInput({
  onSend,
  maxLength = DEFAULT_MAX_LENGTH,
  isLoading = false,
  placeholder = "Add a note...",
  showPinToggle = false,
}: NoteInputProps) {
  const [body, setBody] = useState("");
  const [inputHeight, setInputHeight] = useState(MIN_INPUT_HEIGHT);
  const [isPinned, setIsPinned] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const trimmed = body.trim();
  const isEmpty = trimmed.length === 0;
  const isDisabled = isEmpty || isLoading;
  const showCounter = body.length >= COUNTER_THRESHOLD;
  const isOverLimit = body.length >= maxLength;

  const handleContentSizeChange = useCallback(
    (e: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => {
      const newHeight = Math.min(
        Math.max(e.nativeEvent.contentSize.height, MIN_INPUT_HEIGHT),
        MAX_INPUT_HEIGHT
      );
      setInputHeight(newHeight);
    },
    []
  );

  const handleSend = useCallback(async () => {
    if (isEmpty || isLoading) return;
    const noteBody = trimmed;
    setBody("");
    setInputHeight(MIN_INPUT_HEIGHT);
    onSend(noteBody, showPinToggle ? isPinned : undefined);
    setIsPinned(false);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [isEmpty, isLoading, trimmed, onSend, showPinToggle, isPinned]);

  const handleTogglePin = useCallback(async () => {
    setIsPinned((prev) => !prev);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  return (
    <View style={componentStyles.container}>
      <View className="flex-row items-end">
        <TextInput
          ref={inputRef}
          value={body}
          onChangeText={(text) => setBody(text.slice(0, maxLength))}
          onContentSizeChange={handleContentSizeChange}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          multiline
          style={[
            componentStyles.input,
            { height: inputHeight },
          ]}
          editable={!isLoading}
          maxLength={maxLength}
        />

        {showPinToggle && (
          <Pressable
            onPress={() => void handleTogglePin()}
            className="ml-1 mb-0.5"
            style={[
              componentStyles.pinButton,
              isPinned && componentStyles.pinButtonActive,
            ]}
          >
            <FontAwesomeIcon
              icon={faThumbtack}
              size={14}
              color={isPinned ? "#10B981" : "#9CA3AF"}
              style={{ transform: [{ rotate: "45deg" }] }}
            />
          </Pressable>
        )}

        <Pressable
          onPress={() => void handleSend()}
          disabled={isDisabled}
          className="ml-2 mb-0.5"
          style={[
            componentStyles.sendButton,
            isDisabled && componentStyles.sendButtonDisabled,
          ]}
        >
          <FontAwesomeIcon
            icon={faPaperPlane}
            size={16}
            color={isDisabled ? "#D1D5DB" : "#FFFFFF"}
          />
        </Pressable>
      </View>

      {/* Pin indicator + character counter */}
      <View className="flex-row items-center justify-between mt-1">
        {showPinToggle && isPinned ? (
          <Text className="text-[11px] text-[#10B981] font-medium">
            This note will be pinned
          </Text>
        ) : (
          <View />
        )}
        {showCounter && (
          <Text
            className="text-[11px] text-right"
            style={{ color: isOverLimit ? "#EF4444" : "#9CA3AF" }}
          >
            {body.length}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
}

const componentStyles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
    textAlignVertical: "top",
    paddingTop: 0,
    paddingBottom: 0,
  },
  pinButton: {
    width: 32,
    height: 36,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  pinButtonActive: {
    backgroundColor: "rgba(16,185,129,0.1)",
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2A5B4F",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#F3F4F6",
  },
});
