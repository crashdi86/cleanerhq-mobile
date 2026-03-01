import { useState, useEffect, useCallback } from "react";
import {
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { View, Text } from "@/tw";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faLocationArrow,
  faPlay,
  faCircleCheck,
  faFileInvoiceDollar,
  faClock,
  faClockRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import * as Haptics from "expo-haptics";
import { useJobActions } from "@/hooks/useJobActions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CooldownTimer } from "@/components/job-detail/CooldownTimer";
import { showToast } from "@/store/toast-store";
import type { JobDetail } from "@/lib/api/types";

interface BottomActionBarProps {
  job: JobDetail;
  onChecklistGatePress?: () => void;
  onRunningLatePress?: () => void;
  onNotificationHistoryPress?: () => void;
}

export function BottomActionBar({
  job,
  onChecklistGatePress,
  onRunningLatePress,
  onNotificationHistoryPress,
}: BottomActionBarProps) {
  const insets = useSafeAreaInsets();
  const {
    actionState,
    handleOnMyWay,
    handleStartJob,
    handleCompleteJob,
    isLoading,
    canSend,
    cooldownUntil,
  } = useJobActions(job.id, job);

  const [showConfirm, setShowConfirm] = useState(false);
  const [elapsed, setElapsed] = useState("");
  const [isCooldownActive, setIsCooldownActive] = useState(false);

  // Check if cooldown is currently active
  useEffect(() => {
    if (cooldownUntil) {
      const remaining = new Date(cooldownUntil).getTime() - Date.now();
      setIsCooldownActive(remaining > 0);
    } else {
      setIsCooldownActive(false);
    }
  }, [cooldownUntil]);

  // Elapsed timer for IN_PROGRESS state
  useEffect(() => {
    if (actionState.type !== "IN_PROGRESS" || !job.actual_start_timestamp) {
      return;
    }

    const update = () => {
      const diff =
        Date.now() - new Date(job.actual_start_timestamp!).getTime();
      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setElapsed(
        `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
      );
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [actionState.type, job.actual_start_timestamp]);

  const onPressWithHaptic = useCallback(
    (handler: () => Promise<void>) => async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await handler();
    },
    []
  );

  const onConfirmComplete = useCallback(async () => {
    await handleCompleteJob();
    setShowConfirm(false);
  }, [handleCompleteJob]);

  const onViewInvoice = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    showToast("info", "Invoice view coming soon");
  }, []);

  const handleCooldownExpired = useCallback(() => {
    setIsCooldownActive(false);
  }, []);

  // Show Running Late button for scheduled/in_progress
  const showRunningLate =
    job.status === "scheduled" || job.status === "in_progress";

  // HIDDEN state -- render nothing
  if (actionState.type === "HIDDEN") {
    return null;
  }

  return (
    <>
      <View
        className="absolute bottom-0 left-0 right-0 bg-white px-5 pt-4"
        style={[
          componentStyles.container,
          { paddingBottom: insets.bottom + 16 },
        ]}
      >
        {/* Notification history icon */}
        {(actionState.type === "ON_MY_WAY" ||
          actionState.type === "START_JOB" ||
          actionState.type === "IN_PROGRESS") && (
          <Pressable
            onPress={onNotificationHistoryPress}
            className="absolute top-3 right-5"
            hitSlop={8}
          >
            <FontAwesomeIcon
              icon={faClockRotateLeft}
              size={16}
              color="#9CA3AF"
            />
          </Pressable>
        )}

        {/* ON_MY_WAY */}
        {actionState.type === "ON_MY_WAY" && (
          <>
            {isCooldownActive && cooldownUntil ? (
              <View>
                <Pressable
                  style={[
                    componentStyles.button,
                    componentStyles.primaryButton,
                    componentStyles.buttonDisabled,
                  ]}
                  disabled
                >
                  <FontAwesomeIcon
                    icon={faLocationArrow}
                    size={18}
                    color="#FFFFFF"
                  />
                  <Text className="text-base font-bold text-white ml-2">
                    On My Way
                  </Text>
                </Pressable>
                <View className="mt-2">
                  <CooldownTimer
                    cooldownUntil={cooldownUntil}
                    onExpired={handleCooldownExpired}
                  />
                </View>
              </View>
            ) : (
              <Pressable
                style={({ pressed }) => [
                  componentStyles.button,
                  componentStyles.primaryButton,
                  pressed && componentStyles.buttonPressed,
                  isLoading && componentStyles.buttonDisabled,
                ]}
                onPress={onPressWithHaptic(handleOnMyWay)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <FontAwesomeIcon
                      icon={faLocationArrow}
                      size={18}
                      color="#FFFFFF"
                    />
                    <Text className="text-base font-bold text-white ml-2">
                      On My Way
                    </Text>
                  </>
                )}
              </Pressable>
            )}
          </>
        )}

        {/* START_JOB */}
        {actionState.type === "START_JOB" && (
          <Pressable
            style={({ pressed }) => [
              componentStyles.button,
              componentStyles.primaryButton,
              pressed && componentStyles.buttonPressed,
              isLoading && componentStyles.buttonDisabled,
            ]}
            onPress={onPressWithHaptic(handleStartJob)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <FontAwesomeIcon icon={faPlay} size={18} color="#FFFFFF" />
                <Text className="text-base font-bold text-white ml-2">
                  Start Job
                </Text>
              </>
            )}
          </Pressable>
        )}

        {/* IN_PROGRESS */}
        {actionState.type === "IN_PROGRESS" && (
          <>
            {elapsed !== "" && (
              <Text className="text-xs text-gray-500 mb-2 text-center">
                {elapsed}
              </Text>
            )}

            <Pressable
              style={({ pressed }) => [
                componentStyles.button,
                componentStyles.amberButton,
                pressed && actionState.canComplete
                  ? componentStyles.buttonPressed
                  : undefined,
                !actionState.canComplete && componentStyles.buttonDisabled,
                isLoading && componentStyles.buttonDisabled,
              ]}
              onPress={() => {
                if (!actionState.canComplete) {
                  onChecklistGatePress?.();
                  return;
                }
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setShowConfirm(true);
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <FontAwesomeIcon
                    icon={faCircleCheck}
                    size={18}
                    color="#FFFFFF"
                  />
                  <Text className="text-base font-bold text-white ml-2">
                    Complete Job
                  </Text>
                </>
              )}
            </Pressable>

            {!actionState.canComplete && (
              <Text className="text-xs text-gray-400 mt-1 text-center">
                {actionState.requirements.checklist_complete
                  ? ""
                  : `Checklist incomplete`}
                {!actionState.requirements.checklist_complete &&
                !actionState.requirements.photos_sufficient
                  ? " \u2022 "
                  : ""}
                {actionState.requirements.photos_sufficient
                  ? ""
                  : `${actionState.requirements.current_photos}/${actionState.requirements.min_photos} photos`}
              </Text>
            )}
          </>
        )}

        {/* VIEW_INVOICE */}
        {actionState.type === "VIEW_INVOICE" && (
          <Pressable
            style={({ pressed }) => [
              componentStyles.button,
              componentStyles.outlineButton,
              pressed && componentStyles.buttonPressed,
            ]}
            onPress={onViewInvoice}
          >
            <FontAwesomeIcon
              icon={faFileInvoiceDollar}
              size={18}
              color="#2A5B4F"
            />
            <Text className="text-base font-bold ml-2" style={componentStyles.primaryText}>
              View Invoice
            </Text>
          </Pressable>
        )}

        {/* Running Late button — shown for scheduled and in_progress */}
        {showRunningLate && (
          <Pressable
            style={({ pressed }) => [
              componentStyles.button,
              componentStyles.runningLateButton,
              pressed && componentStyles.buttonPressed,
            ]}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onRunningLatePress?.();
            }}
          >
            <FontAwesomeIcon icon={faClock} size={16} color="#2A5B4F" />
            <Text className="text-sm font-semibold ml-2" style={componentStyles.primaryText}>
              Running Late
            </Text>
            {canSend && (
              <View className="ml-2 bg-gray-100 px-2 py-0.5 rounded-full">
                <Text className="text-xs text-text-secondary">
                  {canSend.running_late_remaining_today}/3
                </Text>
              </View>
            )}
          </Pressable>
        )}
      </View>

      {/* Confirm dialog for completing job */}
      <ConfirmDialog
        visible={showConfirm}
        title="Complete this job?"
        message={`Mark "${job.title}" as completed?`}
        confirmLabel="Complete Job"
        cancelLabel="Cancel"
        variant="default"
        onConfirm={onConfirmComplete}
        onCancel={() => setShowConfirm(false)}
        loading={isLoading}
      />
    </>
  );
}

const componentStyles = StyleSheet.create({
  container: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
  button: {
    height: 52,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#2A5B4F",
  },
  amberButton: {
    backgroundColor: "#F59E0B",
  },
  outlineButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#2A5B4F",
  },
  runningLateButton: {
    height: 44,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(42,91,79,0.2)",
    marginTop: 8,
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryText: {
    color: "#2A5B4F",
  },
});
