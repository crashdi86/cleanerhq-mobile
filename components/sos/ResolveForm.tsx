import React, { useState, useCallback } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { View, Text, Pressable, TextInput } from "@/tw";
import { useResolveSOS } from "@/lib/api/hooks/useSOS";
import { ApiError } from "@/lib/api/client";
import { showToast } from "@/store/toast-store";
import { getErrorMessage } from "@/constants/error-messages";

interface ResolveFormProps {
  alertId: string;
  onResolved: () => void;
}

export function ResolveForm({ alertId, onResolved }: ResolveFormProps) {
  const [notes, setNotes] = useState("");
  const resolveMutation = useResolveSOS();

  const handleResolve = useCallback(async () => {
    const trimmed = notes.trim();
    if (!trimmed) {
      showToast("warning", "Resolution notes are required");
      return;
    }

    try {
      await resolveMutation.mutateAsync({
        id: alertId,
        resolution_notes: trimmed,
      });
      showToast("success", "Alert resolved");
      onResolved();
    } catch (err) {
      if (err instanceof ApiError) {
        showToast("error", getErrorMessage(err.code, "Failed to resolve alert"));
      } else {
        showToast("error", "Failed to resolve alert");
      }
    }
  }, [alertId, notes, resolveMutation, onResolved]);

  return (
    <View className="mt-4">
      <Text className="text-sm font-medium text-text-primary mb-2">
        Resolution Notes *
      </Text>
      <View className="bg-gray-50 border border-border rounded-[16px] px-4 py-3">
        <TextInput
          className="text-base text-text-primary"
          placeholder="Describe how this was resolved..."
          placeholderTextColor="#9CA3AF"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          style={{ minHeight: 72 }}
        />
      </View>

      <Pressable
        onPress={handleResolve}
        disabled={!notes.trim() || resolveMutation.isPending}
        style={[
          styles.resolveButton,
          (!notes.trim() || resolveMutation.isPending) && styles.disabled,
        ]}
      >
        {resolveMutation.isPending ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text className="text-base font-bold text-white">Resolve Alert</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  resolveButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#2A5B4F",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  disabled: {
    opacity: 0.5,
  },
});
