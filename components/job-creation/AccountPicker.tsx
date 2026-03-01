import React, { useState, useCallback, useMemo } from "react";
import { ActivityIndicator, StyleSheet, Modal, FlatList } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faSearch,
  faCheck,
  faBuilding,
  faChevronDown,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { View, Text, Pressable, TextInput } from "@/tw";
import { useAllAccounts } from "@/lib/api/hooks/useJobCreation";
import { colors } from "@/constants/tokens";
import type { AccountListItem } from "@/lib/api/types";

interface AccountPickerProps {
  value: string | undefined;
  onChange: (accountId: string, account: AccountListItem) => void;
  error?: string;
}

export function AccountPicker({ value, onChange, error }: AccountPickerProps) {
  const [showModal, setShowModal] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<AccountListItem | null>(
    null
  );

  const { data: accounts, isLoading } = useAllAccounts();

  const filteredAccounts = useMemo(() => {
    if (!accounts) return [];
    if (!filterText.trim()) return accounts;
    const lower = filterText.toLowerCase();
    return accounts.filter(
      (a) =>
        a.name.toLowerCase().includes(lower) ||
        (a.address && a.address.toLowerCase().includes(lower))
    );
  }, [accounts, filterText]);

  const handleOpen = useCallback(() => {
    setFilterText("");
    setShowModal(true);
  }, []);

  const handleSelect = useCallback(
    (account: AccountListItem) => {
      setSelectedAccount(account);
      setShowModal(false);
      setFilterText("");
      onChange(account.id, account);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    setSelectedAccount(null);
    setShowModal(false);
    setFilterText("");
  }, []);

  const renderAccount = useCallback(
    ({ item }: { item: AccountListItem }) => {
      const isSelected = item.id === value;
      return (
        <Pressable
          onPress={() => handleSelect(item)}
          style={({ pressed }: { pressed: boolean }) => [
            styles.accountRow,
            pressed && styles.accountRowPressed,
            isSelected && styles.accountRowSelected,
          ]}
        >
          <View
            style={[
              styles.accountIcon,
              isSelected && styles.accountIconSelected,
            ]}
          >
            <FontAwesomeIcon
              icon={faBuilding}
              size={14}
              color={isSelected ? "#FFFFFF" : colors.primary.DEFAULT}
            />
          </View>
          <View style={styles.accountInfo}>
            <Text
              className="text-sm font-medium text-text-primary"
              numberOfLines={1}
            >
              {item.name}
            </Text>
            {item.address ? (
              <Text
                className="text-xs text-text-secondary"
                numberOfLines={1}
              >
                {item.address}
              </Text>
            ) : null}
          </View>
          {isSelected && (
            <FontAwesomeIcon
              icon={faCheck}
              size={14}
              color={colors.primary.DEFAULT}
            />
          )}
        </Pressable>
      );
    },
    [handleSelect, value]
  );

  // Selected state — show account with Change button
  if (selectedAccount && value) {
    return (
      <View className="gap-1">
        <Text className="text-sm font-medium text-text-primary mb-1">
          Client Account
        </Text>
        <Pressable
          onPress={handleOpen}
          style={({ pressed }: { pressed: boolean }) => ({
            opacity: pressed ? 0.85 : 1,
          })}
          className="flex-row items-center bg-white border border-primary/20 rounded-[16px] px-4"
          // @ts-expect-error RN style height
          style2={styles.selectedContainer}
        >
          <View style={styles.selectedContainer} className="flex-row items-center flex-1">
            <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-3">
              <FontAwesomeIcon
                icon={faBuilding}
                size={14}
                color={colors.primary.DEFAULT}
              />
            </View>
            <View className="flex-1 mr-2">
              <Text
                className="text-base font-medium text-text-primary"
                numberOfLines={1}
              >
                {selectedAccount.name}
              </Text>
              {selectedAccount.address ? (
                <Text
                  className="text-xs text-text-secondary"
                  numberOfLines={1}
                >
                  {selectedAccount.address}
                </Text>
              ) : null}
            </View>
            <FontAwesomeIcon
              icon={faCheck}
              size={14}
              color={colors.success}
            />
            <Pressable onPress={handleClear} className="ml-3 py-1 px-2">
              <Text className="text-sm font-medium text-primary">Change</Text>
            </Pressable>
          </View>
        </Pressable>
      </View>
    );
  }

  // Default state — tap to open dropdown
  return (
    <View className="gap-1">
      <Text className="text-sm font-medium text-text-primary mb-1">
        Client Account
      </Text>

      <Pressable
        onPress={handleOpen}
        style={({ pressed }: { pressed: boolean }) => ({
          opacity: pressed ? 0.85 : 1,
        })}
        className="flex-row items-center bg-white border border-border rounded-[16px] px-4 py-3"
      >
        <View className="mr-3">
          <FontAwesomeIcon
            icon={faBuilding}
            size={16}
            color={colors.text.secondary}
          />
        </View>
        <Text className="flex-1 text-base text-gray-400">
          Select client account...
        </Text>
        <FontAwesomeIcon
          icon={faChevronDown}
          size={12}
          color={colors.text.secondary}
        />
      </Pressable>

      {error && (
        <Text className="text-xs text-error mt-1">{error}</Text>
      )}

      {/* Dropdown Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setShowModal(false)}
        >
          <Pressable
            style={styles.modal}
            onPress={() => {
              /* prevent bubble */
            }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-text-primary">
                Select Client
              </Text>
              <Pressable
                onPress={() => setShowModal(false)}
                className="w-8 h-8 items-center justify-center rounded-full bg-gray-100"
              >
                <FontAwesomeIcon
                  icon={faXmark}
                  size={16}
                  color={colors.text.secondary}
                />
              </Pressable>
            </View>

            {/* Search/Filter */}
            <View className="flex-row items-center bg-gray-50 border border-border rounded-xl px-3 py-2 mb-3">
              <FontAwesomeIcon
                icon={faSearch}
                size={14}
                color={colors.text.secondary}
              />
              <TextInput
                className="flex-1 text-sm text-text-primary ml-2"
                placeholder="Filter accounts..."
                placeholderTextColor="#9CA3AF"
                value={filterText}
                onChangeText={setFilterText}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {filterText.length > 0 && (
                <Pressable onPress={() => setFilterText("")}>
                  <FontAwesomeIcon
                    icon={faXmark}
                    size={12}
                    color={colors.text.secondary}
                  />
                </Pressable>
              )}
            </View>

            {/* Account List */}
            {isLoading ? (
              <View className="py-8 items-center">
                <ActivityIndicator
                  size="small"
                  color={colors.primary.DEFAULT}
                />
                <Text className="text-sm text-text-secondary mt-2">
                  Loading accounts...
                </Text>
              </View>
            ) : filteredAccounts.length === 0 ? (
              <View className="py-8 items-center">
                <Text className="text-sm text-text-secondary">
                  {filterText
                    ? "No matching accounts"
                    : "No accounts found"}
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredAccounts}
                keyExtractor={(item) => item.id}
                renderItem={renderAccount}
                style={styles.list}
                showsVerticalScrollIndicator
                keyboardShouldPersistTaps="handled"
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  selectedContainer: {
    height: 56,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 16,
  },
  list: {
    maxHeight: 320,
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 2,
  },
  accountRowPressed: {
    backgroundColor: "#F3F4F6",
  },
  accountRowSelected: {
    backgroundColor: "#F0FDF4",
  },
  accountIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(42,91,79,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  accountIconSelected: {
    backgroundColor: "#2A5B4F",
  },
  accountInfo: {
    flex: 1,
    marginRight: 8,
  },
});
