import React, { useState, useEffect, useCallback, useRef } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faSearch,
  faCheck,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";
import { View, Text, Pressable, TextInput } from "@/tw";
import { useAccountSearch } from "@/lib/api/hooks/useJobCreation";
import { colors } from "@/constants/tokens";
import type { AccountListItem } from "@/lib/api/types";

interface AccountPickerProps {
  value: string | undefined;
  onChange: (accountId: string, account: AccountListItem) => void;
  error?: string;
}

export function AccountPicker({ value, onChange, error }: AccountPickerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountListItem | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce the search term by 300ms
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchTerm]);

  const { data: results, isLoading } = useAccountSearch(debouncedTerm);

  const handleSelect = useCallback(
    (account: AccountListItem) => {
      setSelectedAccount(account);
      setSearchTerm("");
      setDebouncedTerm("");
      setIsFocused(false);
      onChange(account.id, account);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    setSelectedAccount(null);
    setSearchTerm("");
    setDebouncedTerm("");
    setIsFocused(true);
  }, []);

  const showDropdown =
    isFocused &&
    !selectedAccount &&
    debouncedTerm.length >= 2 &&
    (isLoading || (results && results.length > 0));

  // If we have a selected account, show the selected state
  if (selectedAccount && value) {
    return (
      <View className="gap-1">
        <Text className="text-sm font-medium text-text-primary mb-1">
          Client Account
        </Text>
        <View
          className="flex-row items-center bg-white border border-primary/20 rounded-[16px] px-4"
          style={styles.selectedContainer}
        >
          <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-3">
            <FontAwesomeIcon
              icon={faBuilding}
              size={14}
              color={colors.primary.DEFAULT}
            />
          </View>
          <View className="flex-1 mr-2">
            <Text className="text-base font-medium text-text-primary" numberOfLines={1}>
              {selectedAccount.name}
            </Text>
            {selectedAccount.address ? (
              <Text className="text-xs text-text-secondary" numberOfLines={1}>
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
      </View>
    );
  }

  return (
    <View className="gap-1">
      <Text className="text-sm font-medium text-text-primary mb-1">
        Client Account
      </Text>

      {/* Search input */}
      <View className="flex-row items-center bg-white border border-border rounded-[16px] px-4 py-3">
        <View className="mr-3">
          <FontAwesomeIcon
            icon={faSearch}
            size={16}
            color={colors.text.secondary}
          />
        </View>
        <TextInput
          className="flex-1 text-base text-text-primary"
          placeholder="Search clients..."
          placeholderTextColor="#6B7280"
          value={searchTerm}
          onChangeText={setSearchTerm}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay to allow tap on result
            setTimeout(() => setIsFocused(false), 200);
          }}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {isLoading && (
          <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
        )}
      </View>

      {/* Dropdown results */}
      {showDropdown && (
        <View className="bg-white border border-border rounded-2xl overflow-hidden" style={styles.dropdown}>
          {isLoading && !results ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
            </View>
          ) : (
            results?.map((account) => (
              <Pressable
                key={account.id}
                onPress={() => handleSelect(account)}
                className="flex-row items-center px-4 py-3 border-b border-border/50 active:bg-gray-50"
              >
                <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-3">
                  <FontAwesomeIcon
                    icon={faBuilding}
                    size={14}
                    color={colors.primary.DEFAULT}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-text-primary" numberOfLines={1}>
                    {account.name}
                  </Text>
                  {account.address ? (
                    <Text className="text-xs text-text-secondary" numberOfLines={1}>
                      {account.address}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            ))
          )}
          {results && results.length === 0 && debouncedTerm.length >= 2 && (
            <View className="py-4 items-center">
              <Text className="text-sm text-text-secondary">
                No clients found
              </Text>
            </View>
          )}
        </View>
      )}

      {error && (
        <Text className="text-xs text-error mt-1">{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  selectedContainer: {
    height: 56,
  },
  dropdown: {
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 0.1,
    shadowColor: "#000",
    elevation: 4,
    maxHeight: 200,
  },
});
