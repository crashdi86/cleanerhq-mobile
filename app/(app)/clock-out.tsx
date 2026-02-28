import React, { useState, useEffect, useCallback, useRef } from "react";
import { StyleSheet, ActivityIndicator } from "react-native";
import { View, Text, Pressable, ScrollView, TextInput } from "@/tw";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faChevronLeft,
  faCheck,
  faCircleExclamation,
  faLocationDot,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import * as Haptics from "expo-haptics";

import { useLocation } from "@/hooks/useLocation";
import { useClockOut } from "@/lib/api/hooks/useTimeTracking";
import { useClockStore } from "@/store/clock-store";
import { useToastStore } from "@/store/toast-store";
import type { ClockOutResponse } from "@/lib/api/types";
import type { ApiError } from "@/lib/api/client";

// ── Phase Type ──

type Phase = "acquiring" | "confirming" | "clocking_out" | "summary" | "override";

// ── Helpers ──

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function calculateDuration(clockInTime: string): { hours: number; minutes: number } {
  const start = new Date(clockInTime).getTime();
  const now = Date.now();
  const diff = Math.max(0, Math.floor((now - start) / 1000));
  return {
    hours: Math.floor(diff / 3600),
    minutes: Math.floor((diff % 3600) / 60),
  };
}

function padMinutes(minutes: number): string {
  return String(minutes).padStart(2, "0");
}

// ── Component ──

export default function ClockOutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const location = useLocation();
  const clockOut = useClockOut();

  const clockInTime = useClockStore((s) => s.clockInTime);
  const activeJobTitle = useClockStore((s) => s.activeJobTitle);
  const activeJobAccountName = useClockStore((s) => s.activeJobAccountName);

  const [phase, setPhase] = useState<Phase>("acquiring");
  const [clockOutData, setClockOutData] = useState<ClockOutResponse | null>(null);
  const [overrideNote, setOverrideNote] = useState("");

  // Track whether we already triggered the haptic for the summary phase
  const hapticFiredRef = useRef(false);

  // ── Redirect if not clocked in ──
  useEffect(() => {
    if (!clockInTime) {
      useToastStore.getState().showToast("warning", "You're not currently clocked in");
      router.replace("/(app)/(tabs)/home");
    }
  }, [clockInTime, router]);

  // ── Auto-acquire GPS on mount ──
  useEffect(() => {
    if (clockInTime) {
      void location.acquire();
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Transition from acquiring → confirming when location is ready ──
  useEffect(() => {
    if (
      phase === "acquiring" &&
      !location.isAcquiring &&
      location.latitude !== null &&
      location.longitude !== null
    ) {
      setPhase("confirming");
    }
  }, [phase, location.isAcquiring, location.latitude, location.longitude]);

  // ── Haptic feedback on summary phase ──
  useEffect(() => {
    if (phase === "summary" && !hapticFiredRef.current) {
      hapticFiredRef.current = true;
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [phase]);

  // ── Clock-out API call ──
  const handleClockOut = useCallback(
    async (overrideGeofence = false) => {
      if (location.latitude === null || location.longitude === null) {
        useToastStore.getState().showToast("error", "Location not available");
        return;
      }

      setPhase("clocking_out");

      try {
        const response = await clockOut.mutateAsync({
          latitude: location.latitude,
          longitude: location.longitude,
          ...(overrideGeofence
            ? { override_geofence: true, override_note: overrideNote }
            : {}),
        });
        setClockOutData(response);
        setPhase("summary");
      } catch (err) {
        const apiErr = err as ApiError;
        if (apiErr.code === "NOT_CLOCKED_IN") {
          useToastStore.getState().showToast("warning", "You're not currently clocked in");
          router.replace("/(app)/(tabs)/home");
        } else if (apiErr.code === "GEOFENCE_VIOLATION") {
          setPhase("override");
        } else {
          useToastStore
            .getState()
            .showToast("error", apiErr.message || "Clock out failed");
          setPhase("confirming");
        }
      }
    },
    [clockOut, location.latitude, location.longitude, overrideNote, router]
  );

  // ── Done action from summary ──
  const handleDone = useCallback(() => {
    useClockStore.getState().setClockedOut();
    router.replace("/(app)/(tabs)/home");
  }, [router]);

  // ── Go back ──
  const handleGoBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(app)/(tabs)/home");
    }
  }, [router]);

  // ── Retry GPS ──
  const handleRetryGps = useCallback(() => {
    void location.acquire();
  }, [location]);

  // Bail early if not clocked in (redirect handled via effect)
  if (!clockInTime) {
    return null;
  }

  const duration = calculateDuration(clockInTime);

  // ── Render Phase Content ──

  function renderPhaseContent(): React.ReactNode {
    switch (phase) {
      case "acquiring":
        return <AcquiringPhase error={location.error} onRetry={handleRetryGps} />;

      case "confirming":
        return (
          <ConfirmingPhase
            duration={duration}
            jobTitle={activeJobTitle}
            accountName={activeJobAccountName}
            onConfirm={() => void handleClockOut(false)}
            onKeepWorking={handleGoBack}
          />
        );

      case "clocking_out":
        return <ClockingOutPhase />;

      case "override":
        return (
          <OverridePhase
            overrideNote={overrideNote}
            onChangeNote={setOverrideNote}
            onOverride={() => void handleClockOut(true)}
            onCancel={() => setPhase("confirming")}
            isSubmitting={clockOut.isPending}
          />
        );

      case "summary":
        return (
          <SummaryPhase
            data={clockOutData}
            jobTitle={activeJobTitle}
            accountName={activeJobAccountName}
            onDone={handleDone}
          />
        );

      default:
        return null;
    }
  }

  return (
    <View className="flex-1 bg-[#F8FAF9]">
      {/* Header */}
      <View className="relative overflow-hidden rounded-b-[32px]" style={styles.headerBg}>
        {/* Decorative mint circle */}
        <View
          className="absolute w-64 h-64 rounded-full"
          style={styles.decorativeCircle}
        />

        <View style={{ paddingTop: insets.top + 12 }} className="px-6 pb-6">
          <View className="flex-row items-center gap-3">
            {/* Back button - hidden during summary */}
            {phase !== "summary" ? (
              <Pressable
                className="w-10 h-10 rounded-xl items-center justify-center"
                style={styles.backButton}
                onPress={handleGoBack}
              >
                <FontAwesomeIcon icon={faChevronLeft} size={16} color="#FFFFFF" />
              </Pressable>
            ) : (
              <View className="w-10 h-10" />
            )}

            <Text className="text-lg font-bold text-white">Clock Out</Text>
          </View>
        </View>
      </View>

      {/* Body */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 py-6 pb-12"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderPhaseContent()}
      </ScrollView>
    </View>
  );
}

// ── Phase Components ──

/** Phase 1: GPS Acquisition */
function AcquiringPhase({
  error,
  onRetry,
}: {
  error: string | null;
  onRetry: () => void;
}) {
  if (error) {
    return (
      <View className="flex-1 items-center justify-center pt-20">
        <View
          className="w-16 h-16 rounded-full items-center justify-center mb-4"
          style={styles.errorCircle}
        >
          <FontAwesomeIcon icon={faCircleExclamation} size={28} color="#EF4444" />
        </View>
        <Text className="text-lg font-bold text-[#1F2937] mb-2">Location Error</Text>
        <Text className="text-sm text-[#6B7280] text-center mb-6 px-4">
          {error}
        </Text>
        <Pressable
          className="px-8 py-3 rounded-2xl"
          style={styles.primaryButton}
          onPress={onRetry}
        >
          <Text className="text-white font-semibold text-base">Try Again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center pt-20">
      <View
        className="w-16 h-16 rounded-full items-center justify-center mb-4"
        style={styles.acquiringCircle}
      >
        <FontAwesomeIcon icon={faLocationDot} size={24} color="#2A5B4F" />
      </View>
      <ActivityIndicator size="large" color="#2A5B4F" style={styles.spinner} />
      <Text className="text-lg font-bold text-[#1F2937] mt-4">Acquiring GPS...</Text>
      <Text className="text-sm text-[#6B7280] mt-1">
        Please wait while we verify your location
      </Text>
    </View>
  );
}

/** Phase 2: Confirm Clock Out */
function ConfirmingPhase({
  duration,
  jobTitle,
  accountName,
  onConfirm,
  onKeepWorking,
}: {
  duration: { hours: number; minutes: number };
  jobTitle: string | null;
  accountName: string | null;
  onConfirm: () => void;
  onKeepWorking: () => void;
}) {
  return (
    <View className="pt-4">
      {/* Duration preview card */}
      <View className="bg-white rounded-2xl p-6 mb-4" style={styles.card}>
        <View className="items-center mb-4">
          <View
            className="w-14 h-14 rounded-full items-center justify-center mb-3"
            style={styles.clockCircle}
          >
            <FontAwesomeIcon icon={faClock} size={24} color="#2A5B4F" />
          </View>
          <Text className="text-sm text-[#6B7280] mb-1">
            {"You've been working for"}
          </Text>
          <Text className="text-3xl font-bold text-[#2A5B4F]" style={styles.monoFont}>
            {duration.hours}h {padMinutes(duration.minutes)}m
          </Text>
        </View>

        {/* Job info */}
        {(jobTitle || accountName) && (
          <View className="border-t border-gray-100 pt-4 mt-2">
            {jobTitle && (
              <Text className="text-base font-semibold text-[#1F2937] text-center">
                {jobTitle}
              </Text>
            )}
            {accountName && (
              <Text className="text-sm text-[#6B7280] text-center mt-1">
                {accountName}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Action buttons */}
      <View className="gap-3 mt-2">
        <Pressable
          className="h-14 rounded-2xl items-center justify-center"
          style={styles.primaryButton}
          onPress={onConfirm}
        >
          <Text className="text-white font-bold text-base">Clock Out</Text>
        </Pressable>

        <Pressable
          className="h-14 rounded-2xl items-center justify-center"
          style={styles.secondaryButton}
          onPress={onKeepWorking}
        >
          <Text className="text-[#6B7280] font-semibold text-base">Keep Working</Text>
        </Pressable>
      </View>
    </View>
  );
}

/** Phase 3: Clocking Out Loading */
function ClockingOutPhase() {
  return (
    <View className="flex-1 items-center justify-center pt-20">
      <ActivityIndicator size="large" color="#2A5B4F" />
      <Text className="text-lg font-bold text-[#1F2937] mt-4">Clocking out...</Text>
      <Text className="text-sm text-[#6B7280] mt-1">
        Saving your time entry
      </Text>
    </View>
  );
}

/** Phase 4: Geofence Override */
function OverridePhase({
  overrideNote,
  onChangeNote,
  onOverride,
  onCancel,
  isSubmitting,
}: {
  overrideNote: string;
  onChangeNote: (text: string) => void;
  onOverride: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const isNoteEmpty = overrideNote.trim().length === 0;

  return (
    <View className="pt-4">
      {/* Warning card */}
      <View className="bg-red-50 rounded-2xl p-5 border border-red-100 mb-4">
        <View className="flex-row items-center gap-3 mb-3">
          <View
            className="w-10 h-10 rounded-full items-center justify-center"
            style={styles.warningIconCircle}
          >
            <FontAwesomeIcon icon={faCircleExclamation} size={20} color="#EF4444" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-[#1F2937]">
              {"You're outside the job location"}
            </Text>
          </View>
        </View>

        <Text className="text-sm text-[#6B7280] mb-4">
          Please provide a reason for clocking out here:
        </Text>

        <TextInput
          className="bg-white rounded-xl p-3 border border-gray-200 text-[#1F2937] text-sm"
          style={styles.overrideInput}
          multiline
          numberOfLines={4}
          placeholder="e.g., Job was moved to a different location..."
          placeholderTextColor="#9CA3AF"
          value={overrideNote}
          onChangeText={onChangeNote}
          textAlignVertical="top"
        />
      </View>

      {/* Action buttons */}
      <View className="gap-3">
        <Pressable
          className="h-14 rounded-2xl items-center justify-center"
          style={[
            styles.primaryButton,
            (isNoteEmpty || isSubmitting) && styles.disabledButton,
          ]}
          onPress={onOverride}
          disabled={isNoteEmpty || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text className="text-white font-bold text-base">
              {"Override & Clock Out"}
            </Text>
          )}
        </Pressable>

        <Pressable
          className="h-14 rounded-2xl items-center justify-center"
          style={styles.secondaryButton}
          onPress={onCancel}
          disabled={isSubmitting}
        >
          <Text className="text-[#6B7280] font-semibold text-base">Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

/** Phase 5: Success Summary */
function SummaryPhase({
  data,
  jobTitle,
  accountName,
  onDone,
}: {
  data: ClockOutResponse | null;
  jobTitle: string | null;
  accountName: string | null;
  onDone: () => void;
}) {
  if (!data) return null;

  const totalHours = Math.floor(data.total_minutes / 60);
  const totalMins = data.total_minutes % 60;
  const clockInFormatted = formatTime(data.clock_in_time);
  const clockOutFormatted = formatTime(data.clock_out_time);

  return (
    <View className="pt-4 items-center">
      {/* Success icon */}
      <View
        className="w-20 h-20 rounded-full items-center justify-center mb-4"
        style={styles.successCircle}
      >
        <FontAwesomeIcon icon={faCheck} size={32} color="#2A5B4F" />
      </View>

      {/* Shift Complete badge */}
      <View className="bg-[#B7F0AD]/20 px-4 py-2 rounded-full mb-6">
        <Text className="text-sm font-semibold text-[#2A5B4F]">Shift Complete</Text>
      </View>

      {/* Total duration */}
      <Text className="text-4xl font-bold text-[#2A5B4F] mb-6" style={styles.monoFont}>
        {totalHours} hrs {padMinutes(totalMins)} min
      </Text>

      {/* Time details card */}
      <View className="bg-white rounded-2xl p-5 w-full mb-4" style={styles.card}>
        {/* Clock In row */}
        <View className="flex-row items-center justify-between py-3">
          <View className="flex-row items-center gap-3">
            <View
              className="w-8 h-8 rounded-lg items-center justify-center"
              style={styles.timeIconBg}
            >
              <FontAwesomeIcon icon={faClock} size={14} color="#2A5B4F" />
            </View>
            <Text className="text-sm text-[#6B7280]">Clocked In</Text>
          </View>
          <Text className="text-sm font-semibold text-[#1F2937]" style={styles.monoFont}>
            {clockInFormatted}
          </Text>
        </View>

        {/* Divider */}
        <View className="h-px bg-gray-100" />

        {/* Clock Out row */}
        <View className="flex-row items-center justify-between py-3">
          <View className="flex-row items-center gap-3">
            <View
              className="w-8 h-8 rounded-lg items-center justify-center"
              style={styles.timeIconBg}
            >
              <FontAwesomeIcon icon={faClock} size={14} color="#2A5B4F" />
            </View>
            <Text className="text-sm text-[#6B7280]">Clocked Out</Text>
          </View>
          <Text className="text-sm font-semibold text-[#1F2937]" style={styles.monoFont}>
            {clockOutFormatted}
          </Text>
        </View>
      </View>

      {/* Job info card */}
      {(jobTitle || accountName) && (
        <View className="bg-white rounded-2xl p-5 w-full mb-6" style={styles.card}>
          {jobTitle && (
            <Text className="text-base font-semibold text-[#1F2937]">{jobTitle}</Text>
          )}
          {accountName && (
            <Text className="text-sm text-[#6B7280] mt-1">{accountName}</Text>
          )}
        </View>
      )}

      {/* Done button */}
      <Pressable
        className="h-14 rounded-2xl items-center justify-center w-full"
        style={styles.primaryButton}
        onPress={onDone}
      >
        <Text className="text-white font-bold text-base">Done</Text>
      </Pressable>
    </View>
  );
}

// ── Styles ──

const styles = StyleSheet.create({
  headerBg: {
    backgroundColor: "#2A5B4F",
  },
  decorativeCircle: {
    backgroundColor: "#B7F0AD",
    opacity: 0.08,
    top: -40,
    right: -60,
  },
  backButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: "#2A5B4F",
  },
  secondaryButton: {
    backgroundColor: "#F3F4F6",
  },
  disabledButton: {
    opacity: 0.5,
  },
  acquiringCircle: {
    backgroundColor: "rgba(42, 91, 79, 0.1)",
  },
  clockCircle: {
    backgroundColor: "rgba(42, 91, 79, 0.1)",
  },
  errorCircle: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  successCircle: {
    backgroundColor: "rgba(183, 240, 173, 0.3)",
  },
  warningIconCircle: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  timeIconBg: {
    backgroundColor: "rgba(42, 91, 79, 0.08)",
  },
  overrideInput: {
    minHeight: 80,
  },
  monoFont: {
    fontFamily: "JetBrainsMono",
  },
  spinner: {
    marginTop: 8,
  },
});
