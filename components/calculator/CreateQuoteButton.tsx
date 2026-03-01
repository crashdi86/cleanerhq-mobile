/**
 * M-13 S7: Create Quote button.
 * Opens account picker → calls useCreateQuoteFromCalculator → navigates on success.
 */

import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet } from "react-native";
import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faFileInvoiceDollar } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "expo-router";
import { AccountPickerModal } from "./AccountPickerModal";
import { useAllAccounts } from "@/lib/api/hooks/useJobCreation";
import { useCreateQuoteFromCalculator } from "@/lib/api/hooks/useCalculator";
import type { TierLevel, AccountListItem } from "@/lib/api/types";

interface CreateQuoteButtonProps {
  selectedTier: TierLevel;
  selectedTotal: number;
  projectName: string;
  calculatorInput: Record<string, unknown>;
  calculatorOutput: Record<string, unknown>;
}

export function CreateQuoteButton({
  selectedTier,
  selectedTotal,
  projectName,
  calculatorInput,
  calculatorOutput,
}: CreateQuoteButtonProps) {
  const router = useRouter();
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const { data: accounts = [], isLoading: accountsLoading } = useAllAccounts();
  const createQuote = useCreateQuoteFromCalculator();

  const handleAccountSelect = useCallback(
    (account: AccountListItem) => {
      setShowAccountPicker(false);

      createQuote.mutate(
        {
          account_id: account.id,
          calculator_input: calculatorInput,
          calculator_output: calculatorOutput,
          project_name: projectName,
          selected_tier: selectedTier,
          selected_total: selectedTotal,
        },
        {
          onSuccess: (data) => {
            Alert.alert(
              "Quote Created",
              `Quote ${data.quote_number} has been created successfully.`,
              [
                {
                  text: "OK",
                  onPress: () => router.back(),
                },
              ],
            );
          },
          onError: (error) => {
            const message =
              error instanceof Error
                ? error.message
                : "Failed to create quote. Please try again.";
            Alert.alert("Error", message);
          },
        },
      );
    },
    [
      calculatorInput,
      calculatorOutput,
      projectName,
      selectedTier,
      selectedTotal,
      createQuote,
      router,
    ],
  );

  return (
    <View>
      <Pressable
        onPress={() => setShowAccountPicker(true)}
        disabled={createQuote.isPending}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          createQuote.isPending && styles.buttonDisabled,
        ]}
      >
        {createQuote.isPending ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <FontAwesomeIcon
              icon={faFileInvoiceDollar}
              size={18}
              color="#FFFFFF"
            />
            <Text style={styles.buttonText}>Create Quote</Text>
          </>
        )}
      </Pressable>

      <AccountPickerModal
        visible={showAccountPicker}
        accounts={accounts}
        isLoading={accountsLoading}
        onSelect={handleAccountSelect}
        onClose={() => setShowAccountPicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#2A5B4F",
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: "#2A5B4F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "PlusJakartaSans",
  },
});
