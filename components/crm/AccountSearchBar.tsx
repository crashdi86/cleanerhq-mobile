import React, { useState, useCallback } from "react";
import {
  TextInput,
  StyleSheet,
  Modal,
} from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faMagnifyingGlass,
  faXmark,
  faArrowDownShortWide,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

interface AccountSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

const SORT_OPTIONS = [
  { value: "name", label: "Name A-Z" },
  { value: "-name", label: "Name Z-A" },
  { value: "-created_at", label: "Newest" },
  { value: "created_at", label: "Oldest" },
] as const;

/**
 * M-11 S1: Debounced search input with sort picker for accounts list.
 */
export function AccountSearchBar({
  value,
  onChangeText,
  sortBy,
  onSortChange,
}: AccountSearchBarProps) {
  const [showSortModal, setShowSortModal] = useState(false);

  const handleClear = useCallback(() => {
    onChangeText("");
  }, [onChangeText]);

  const handleSortSelect = useCallback(
    (sort: string) => {
      onSortChange(sort);
      setShowSortModal(false);
    },
    [onSortChange]
  );

  return (
    <>
      <View style={styles.container}>
        {/* Search input */}
        <View style={styles.inputContainer}>
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            size={14}
            color="#9CA3AF"
          />
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder="Search clients..."
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {value.length > 0 && (
            <Pressable onPress={handleClear} hitSlop={8}>
              <FontAwesomeIcon icon={faXmark} size={14} color="#9CA3AF" />
            </Pressable>
          )}
        </View>

        {/* Sort button */}
        <Pressable
          onPress={() => setShowSortModal(true)}
          style={({ pressed }) => [
            styles.sortButton,
            pressed && styles.sortButtonPressed,
          ]}
        >
          <FontAwesomeIcon
            icon={faArrowDownShortWide}
            size={16}
            color="#2A5B4F"
          />
        </Pressable>
      </View>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <Pressable
          onPress={() => setShowSortModal(false)}
          style={styles.modalOverlay}
        >
          <Pressable onPress={() => {}} style={styles.modalContent}>
            <Text className="text-base font-bold text-gray-900 mb-3">
              Sort By
            </Text>
            {SORT_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => handleSortSelect(option.value)}
                className="flex-row items-center justify-between py-3"
                style={styles.sortOption}
              >
                <Text
                  className="text-[15px]"
                  style={{
                    color:
                      sortBy === option.value ? "#2A5B4F" : "#1F2937",
                    fontWeight: sortBy === option.value ? "600" : "400",
                  }}
                >
                  {option.label}
                </Text>
                {sortBy === option.value && (
                  <FontAwesomeIcon
                    icon={faCheck}
                    size={14}
                    color="#2A5B4F"
                  />
                )}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    height: 44,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
    paddingVertical: 0,
  },
  sortButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  sortButtonPressed: {
    backgroundColor: "#F3F4F6",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "80%",
    maxWidth: 320,
  },
  sortOption: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F3F4F6",
  },
});
