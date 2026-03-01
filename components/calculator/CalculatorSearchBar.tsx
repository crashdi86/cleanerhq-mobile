/**
 * M-13 S1: Search bar for filtering calculator types.
 */

import React from "react";
import { TextInput, Pressable, StyleSheet } from "react-native";
import { View } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";

interface CalculatorSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

export function CalculatorSearchBar({
  value,
  onChangeText,
}: CalculatorSearchBarProps) {
  return (
    <View style={styles.container}>
      <FontAwesomeIcon
        icon={faMagnifyingGlass}
        size={16}
        color="#9CA3AF"
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search calculators..."
        placeholderTextColor="#9CA3AF"
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText("")} hitSlop={8}>
          <FontAwesomeIcon
            icon={faXmark}
            size={16}
            color="#9CA3AF"
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAF9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    height: 44,
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
    fontFamily: "PlusJakartaSans",
    padding: 0,
  },
});
