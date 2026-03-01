import React, { useState, useCallback, useMemo } from "react";
import { LayoutAnimation, StyleSheet } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faThumbtack } from "@fortawesome/free-solid-svg-icons";
import { NoteAvatar } from "./NoteAvatar";
import { formatRelativeTime } from "@/lib/format-time";
import { useAuthStore } from "@/store/auth-store";
import type { JobNote, AccountNote } from "@/lib/api/types";

interface NoteCardProps {
  note: JobNote | AccountNote;
  variant?: "default" | "pinned";
}

/**
 * Reusable note card with author, timestamp, and expand/collapse.
 *
 * Sticky-note visual: subtle yellow tint with left accent border.
 * Pinned variant: green tint with pin icon.
 * Optimistic notes (temp-* IDs) show dimmed.
 */
export function NoteCard({ note, variant = "default" }: NoteCardProps) {
  const userId = useAuthStore((s) => s.user?.id);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);

  // Normalize field names between JobNote (body/author_name) and AccountNote (content/author_email)
  const noteContent = "content" in note ? note.content : note.body;
  const authorDisplay =
    "author_email" in note ? note.author_email : note.author_name;
  const authorAvatar =
    "author_avatar_url" in note ? note.author_avatar_url : null;
  const isPinned =
    variant === "pinned" ||
    ("is_pinned" in note && note.is_pinned) ||
    ("pinned" in note && (note as { pinned?: boolean }).pinned === true);
  const isOptimistic = note.id.startsWith("temp-");
  const isCurrentUser = note.author_id === userId;
  const relativeTime = formatRelativeTime(note.created_at);

  const handleToggleExpand = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded((prev) => !prev);
  }, []);

  const handleTextLayout = useCallback(
    (e: { nativeEvent: { lines: unknown[] } }) => {
      if (!isExpanded && e.nativeEvent.lines.length > 3) {
        setIsTruncated(true);
      }
    },
    [isExpanded]
  );

  // Parse markdown-lite: **bold**, *italic*, bullet lists
  const renderedBody = useMemo(() => {
    return parseMarkdownLite(noteContent);
  }, [noteContent]);

  const containerStyle = isPinned
    ? [componentStyles.card, componentStyles.pinnedCard]
    : [componentStyles.card, componentStyles.defaultCard];

  return (
    <View
      style={[...containerStyle, isOptimistic && componentStyles.optimistic]}
    >
      {/* Author row */}
      <View className="flex-row items-center mb-2">
        <NoteAvatar
          name={authorDisplay}
          avatarUrl={authorAvatar}
          size={32}
        />
        <View className="flex-1 ml-2">
          <View className="flex-row items-center">
            <Text className="text-sm font-semibold text-gray-900">
              {authorDisplay}
            </Text>
            {isCurrentUser && (
              <View className="bg-[#B7F0AD] rounded-md px-1.5 py-0.5 ml-1.5">
                <Text className="text-[10px] font-medium text-[#1F2937]">
                  You
                </Text>
              </View>
            )}
            {isPinned && (
              <View className="ml-1.5">
                <FontAwesomeIcon
                  icon={faThumbtack}
                  size={10}
                  color="#10B981"
                  style={{ transform: [{ rotate: "45deg" }] }}
                />
              </View>
            )}
          </View>
        </View>
        <Text className="text-xs text-gray-400">{relativeTime}</Text>
      </View>

      {/* Body */}
      <View>
        {isExpanded ? (
          renderedBody
        ) : (
          <Text
            className="text-[15px] text-gray-900 leading-6"
            numberOfLines={3}
            onTextLayout={handleTextLayout}
          >
            {noteContent}
          </Text>
        )}
      </View>

      {/* Show more / Show less */}
      {(isTruncated || isExpanded) && (
        <Pressable onPress={handleToggleExpand} className="mt-1">
          <Text className="text-xs font-medium text-[#2A5B4F]">
            {isExpanded ? "Show less" : "Show more"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

// ── Markdown-lite parser ──

function parseMarkdownLite(text: string): React.ReactElement {
  const lines = text.split("\n");

  const elements: React.ReactElement[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    const key = `line-${i}`;

    // Bullet list item
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const content = line.slice(2);
      elements.push(
        <View key={key} className="flex-row mt-0.5">
          <Text className="text-[15px] text-gray-900 leading-6 mr-1.5">
            {"\u2022"}
          </Text>
          <Text className="text-[15px] text-gray-900 leading-6 flex-1">
            {renderInlineFormatting(content)}
          </Text>
        </View>
      );
    } else {
      elements.push(
        <Text key={key} className="text-[15px] text-gray-900 leading-6">
          {renderInlineFormatting(line)}
        </Text>
      );
    }
  }

  return <>{elements}</>;
}

function renderInlineFormatting(text: string): React.ReactNode {
  // Match **bold** and *italic* patterns
  const parts: React.ReactNode[] = [];
  // Regex: **bold** or *italic*
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // eslint-disable-next-line no-cond-assign
  while ((match = regex.exec(text)) !== null) {
    // Push text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // Bold
      parts.push(
        <Text key={`b-${match.index}`} className="font-bold">
          {match[2]}
        </Text>
      );
    } else if (match[4]) {
      // Italic
      parts.push(
        <Text key={`i-${match.index}`} className="italic">
          {match[4]}
        </Text>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Push remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 0 ? text : parts;
}

const componentStyles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  defaultCard: {
    backgroundColor: "#FFFDE7",
    borderLeftWidth: 3,
    borderLeftColor: "#FBC02D",
  },
  pinnedCard: {
    backgroundColor: "#F0FAF4",
    borderLeftWidth: 3,
    borderLeftColor: "#10B981",
  },
  optimistic: {
    opacity: 0.6,
  },
});
