/**
 * M-13 S7: Account picker bottom sheet modal.
 * Searchable list of CRM accounts for quote creation.
 */

import React, { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, TextInput } from "react-native";
import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faBuilding,
  faMagnifyingGlass,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import type { AccountListItem } from "@/lib/api/types";

interface AccountPickerModalProps {
  visible: boolean;
  accounts: AccountListItem[];
  isLoading: boolean;
  onSelect: (account: AccountListItem) => void;
  onClose: () => void;
}

export function AccountPickerModal({
  visible,
  accounts,
  isLoading,
  onSelect,
  onClose,
}: AccountPickerModalProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const snapPoints = useMemo(() => ["65%", "90%"], []);

  const filteredAccounts = useMemo(() => {
    if (!searchQuery.trim()) return accounts;
    const query = searchQuery.toLowerCase();
    return accounts.filter(
      (a) =>
        a.name.toLowerCase().includes(query) ||
        a.address.toLowerCase().includes(query),
    );
  }, [accounts, searchQuery]);

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  const handleClose = useCallback(() => {
    bottomSheetRef.current?.close();
    setSearchQuery("");
    onClose();
  }, [onClose]);

  const renderItem = useCallback(
    ({ item }: { item: AccountListItem }) => (
      <Pressable
        onPress={() => {
          onSelect(item);
          handleClose();
        }}
        style={({ pressed }) => [
          styles.accountRow,
          pressed && styles.accountRowPressed,
        ]}
      >
        <View style={styles.accountIcon}>
          <FontAwesomeIcon icon={faBuilding} size={16} color="#2A5B4F" />
        </View>
        <View style={styles.accountInfo}>
          <Text style={styles.accountName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.accountAddress} numberOfLines={1}>
            {item.address}
          </Text>
        </View>
      </Pressable>
    ),
    [onSelect, handleClose],
  );

  if (!visible) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={handleClose}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.indicator}
      backgroundStyle={styles.sheetBg}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Select Account</Text>
        <Pressable onPress={handleClose} hitSlop={8}>
          <FontAwesomeIcon icon={faXmark} size={20} color="#6B7280" />
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <FontAwesomeIcon icon={faMagnifyingGlass} size={14} color="#9CA3AF" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search accounts..."
          placeholderTextColor="#9CA3AF"
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
            <FontAwesomeIcon icon={faXmark} size={14} color="#9CA3AF" />
          </Pressable>
        )}
      </View>

      {/* Account list */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center py-12">
          <Text className="text-gray-400">Loading accounts...</Text>
        </View>
      ) : filteredAccounts.length === 0 ? (
        <View className="flex-1 items-center justify-center py-12">
          <Text className="text-gray-400">No accounts found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAccounts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  indicator: {
    backgroundColor: "#D1D5DB",
    width: 40,
  },
  sheetBg: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    fontFamily: "PlusJakartaSans",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAF9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    height: 40,
    marginHorizontal: 20,
    marginBottom: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
    fontFamily: "PlusJakartaSans",
    padding: 0,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F3F4F6",
  },
  accountRowPressed: {
    backgroundColor: "#F9FAFB",
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(42,91,79,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    fontFamily: "PlusJakartaSans",
  },
  accountAddress: {
    fontSize: 13,
    fontWeight: "400",
    color: "#6B7280",
    marginTop: 2,
    fontFamily: "PlusJakartaSans",
  },
});
