import React from "react";
import { View, Text } from "@/tw";
import { Image } from "expo-image";
import { StyleSheet } from "react-native";

interface NoteAvatarProps {
  name: string;
  avatarUrl: string | null;
  size?: number;
}

export function NoteAvatar({ name, avatarUrl, size = 32 }: NoteAvatarProps) {
  const initials = name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
        contentFit="cover"
        transition={200}
      />
    );
  }

  return (
    <View
      className="bg-gray-200 items-center justify-center"
      style={{ width: size, height: size, borderRadius: size / 2 }}
    >
      <Text
        className="font-semibold text-gray-500"
        style={{ fontSize: size * 0.375 }}
      >
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: "#E5E7EB",
  },
});
