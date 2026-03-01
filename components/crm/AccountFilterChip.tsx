import React from "react";
import { StyleSheet } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

interface AccountFilterChipProps {
  accountName: string;
  onRemove: () => void;
}

/**
 * M-11 S3: Removable filter chip showing active account filter on contacts list.
 */
export function AccountFilterChip({
  accountName,
  onRemove,
}: AccountFilterChipProps) {
  return (
    <View style={styles.chip}>
      <Text className="text-[13px] font-medium text-[#2A5B4F]" numberOfLines={1}>
        {accountName}
      </Text>
      <Pressable onPress={onRemove} hitSlop={8} style={styles.removeButton}>
        <FontAwesomeIcon icon={faXmark} size={10} color="#2A5B4F" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(183,240,173,0.25)",
    borderRadius: 12,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 6,
    marginBottom: 8,
    gap: 6,
  },
  removeButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(42,91,79,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
});
