import React, { useState, useCallback } from "react";
import { Modal, StyleSheet, ActivityIndicator } from "react-native";
import { View, Text, Pressable, TextInput } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faXmark, faClock } from "@fortawesome/free-solid-svg-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useRunningLate } from "@/lib/api/hooks/useNotifications";
import { useLocation } from "@/hooks/useLocation";
import { ApiError } from "@/lib/api/client";
import { showToast } from "@/store/toast-store";
import { getErrorMessage } from "@/constants/error-messages";

const DELAY_OPTIONS = [5, 10, 15, 30, 60, 120] as const;

interface RunningLateSheetProps {
  visible: boolean;
  jobId: string;
  remainingToday: number;
  onClose: () => void;
}

export function RunningLateSheet({
  visible,
  jobId,
  remainingToday,
  onClose,
}: RunningLateSheetProps) {
  const insets = useSafeAreaInsets();
  const [selectedDelay, setSelectedDelay] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const runningLateMutation = useRunningLate();
  const location = useLocation();

  const isSubmitting = runningLateMutation.isPending || location.isAcquiring;

  const handleClose = useCallback(() => {
    setSelectedDelay(null);
    setReason("");
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(async () => {
    if (selectedDelay === null) return;

    try {
      const coords = await location.acquire();

      const result = await runningLateMutation.mutateAsync({
        id: jobId,
        delay_minutes: selectedDelay,
        reason: reason.trim() || undefined,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
      });

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      showToast(
        "success",
        `Client notified — ${selectedDelay} min delay`
      );
      setSelectedDelay(null);
      setReason("");
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        switch (err.code) {
          case "NOTIFICATION_DAILY_LIMIT":
            showToast("warning", getErrorMessage("NOTIFICATION_DAILY_LIMIT"));
            break;
          case "NOTIFICATIONS_DISABLED":
            showToast("error", getErrorMessage("NOTIFICATIONS_DISABLED"));
            handleClose();
            break;
          case "NO_CONTACT_METHOD":
            showToast("error", getErrorMessage("NO_CONTACT_METHOD"));
            handleClose();
            break;
          default:
            showToast(
              "error",
              getErrorMessage(err.code, "Failed to send notification")
            );
            break;
        }
      } else {
        showToast("error", "Failed to send notification");
      }
    }
  }, [selectedDelay, reason, jobId, location, runningLateMutation, onClose, handleClose]);

  const formatDelay = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs} hr`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      <View className="flex-1 justify-end bg-black/40">
        <Pressable className="flex-1" onPress={handleClose} />
        <View
          className="bg-white rounded-t-3xl"
          style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}
        >
          {/* Handle bar */}
          <View className="items-center pt-3 pb-2">
            <View className="w-10 h-1 rounded-full bg-gray-300" />
          </View>

          {/* Header */}
          <View className="flex-row items-center px-5 py-3">
            <View className="w-8 h-8 rounded-full bg-amber-50 items-center justify-center mr-3">
              <FontAwesomeIcon icon={faClock} size={16} color="#F59E0B" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900">
                Running Late
              </Text>
              <Text className="text-sm text-gray-500">
                Notify client of delay
              </Text>
            </View>
            <View className="bg-gray-100 px-2.5 py-1 rounded-full mr-3">
              <Text className="text-xs font-medium text-text-secondary">
                {remainingToday}/3 remaining
              </Text>
            </View>
            <Pressable onPress={handleClose} hitSlop={8}>
              <FontAwesomeIcon icon={faXmark} size={20} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Delay buttons grid */}
          <View className="px-5 pt-2">
            <Text className="text-sm font-medium text-text-primary mb-3">
              How late will you be?
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {DELAY_OPTIONS.map((delay) => {
                const isSelected = selectedDelay === delay;
                return (
                  <Pressable
                    key={delay}
                    onPress={() => setSelectedDelay(delay)}
                    style={[
                      styles.delayButton,
                      isSelected && styles.delayButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.delayText,
                        isSelected && styles.delayTextSelected,
                      ]}
                    >
                      {formatDelay(delay)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Reason input */}
          <View className="px-5 pt-4">
            <Text className="text-sm font-medium text-text-primary mb-2">
              Reason (optional)
            </Text>
            <View className="bg-gray-50 border border-border rounded-[16px] px-4 py-3">
              <TextInput
                className="text-base text-text-primary"
                placeholder="e.g. Traffic on I-85"
                placeholderTextColor="#9CA3AF"
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
                maxLength={500}
                style={{ minHeight: 48 }}
              />
            </View>
            <Text className="text-xs text-text-secondary text-right mt-1">
              {reason.length}/500
            </Text>
          </View>

          {/* Submit button */}
          <View className="px-5 pt-3">
            <Pressable
              onPress={handleSubmit}
              disabled={selectedDelay === null || isSubmitting || remainingToday <= 0}
              style={[
                styles.submitButton,
                (selectedDelay === null || remainingToday <= 0) &&
                  styles.submitButtonDisabled,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text className="text-base font-bold text-white">
                  {remainingToday <= 0 ? "Daily Limit Reached" : "Notify Client"}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 16,
  },
  delayButton: {
    width: "31%",
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  delayButtonSelected: {
    backgroundColor: "#2A5B4F",
  },
  delayText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  delayTextSelected: {
    color: "#FFFFFF",
  },
  submitButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#2A5B4F",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
});
