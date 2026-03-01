import React, { useRef, useEffect } from "react";
import { TextInput, StyleSheet } from "react-native";
import { View, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";

interface CRMSearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  autoFocus?: boolean;
  placeholder?: string;
}

/**
 * M-11 S5: Auto-focusing search input for global CRM search.
 */
export function CRMSearchInput({
  value,
  onChangeText,
  onClear,
  autoFocus = true,
  placeholder = "Search accounts, contacts, jobs...",
}: CRMSearchInputProps) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (autoFocus) {
      // Small delay to allow screen transition to complete
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  return (
    <View style={styles.container}>
      <FontAwesomeIcon icon={faMagnifyingGlass} size={16} color="#9CA3AF" />
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        style={styles.input}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <Pressable onPress={onClear} hitSlop={8}>
          <FontAwesomeIcon icon={faXmark} size={16} color="#9CA3AF" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    height: 48,
    gap: 10,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    paddingVertical: 0,
  },
});
