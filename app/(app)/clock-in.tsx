import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { StyleSheet, ActivityIndicator, Platform } from "react-native";
import { View, Text, Pressable, ScrollView, TextInput } from "@/tw";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faChevronLeft,
  faFingerprint,
  faCheck,
  faLocationDot,
  faPhone,
  faKey,
  faCopy,
  faStopwatch,
} from "@fortawesome/free-solid-svg-icons";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";

import { useLocation } from "@/hooks/useLocation";
import { useClockIn, useTimeStatus } from "@/lib/api/hooks/useTimeTracking";
import { useMySchedule } from "@/lib/api/hooks/useDashboard";
import { useClockStore } from "@/store/clock-store";
import { useToastStore } from "@/store/toast-store";
import { ClockRing } from "@/components/clock/ClockRing";
import { GeofenceIndicator } from "@/components/clock/GeofenceIndicator";
import { PINModal } from "@/components/clock/PINModal";
import type { ApiError } from "@/lib/api/client";
import type { ScheduleJob } from "@/lib/api/types";

// ── Helpers ──

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTimeRange(start: string, end: string): string {
  const fmt = (iso: string): string =>
    new Date(iso).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  return `${fmt(start)} - ${fmt(end)}`;
}

function findNextJob(jobs: ScheduleJob[]): ScheduleJob | undefined {
  const now = Date.now();
  return jobs.find(
    (job) =>
      job.status === "scheduled" &&
      new Date(job.scheduled_start).getTime() > now
  );
}

function findJobById(
  jobs: ScheduleJob[],
  jobId: string
): ScheduleJob | undefined {
  return jobs.find((job) => job.id === jobId);
}

// ── Component ──

export default function ClockInScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { jobId } = useLocalSearchParams<{ jobId?: string }>();

  // ── Data hooks ──
  const location = useLocation();
  const clockIn = useClockIn();
  const { data: timeStatus } = useTimeStatus();
  const todayDate = useMemo(() => getTodayDateString(), []);
  const { data: scheduleData } = useMySchedule(todayDate);
  const showToast = useToastStore((s) => s.showToast);

  // ── State machine ──
  const [ringState, setRingState] = useState<"idle" | "acquiring" | "success">(
    "idle"
  );
  const [ringProgress, setRingProgress] = useState(0);
  const [showPIN, setShowPIN] = useState(false);
  const [pinError, setPinError] = useState<string | undefined>(undefined);
  const [showOverride, setShowOverride] = useState(false);
  const [overrideNote, setOverrideNote] = useState("");
  const [isClockingIn, setIsClockingIn] = useState(false);
  const [copiedGateCode, setCopiedGateCode] = useState(false);

  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Derived data ──
  const jobs = scheduleData?.jobs ?? [];
  const targetJob = useMemo(() => {
    if (jobId) {
      return findJobById(jobs, jobId);
    }
    return findNextJob(jobs);
  }, [jobs, jobId]);

  const geofenceStatus = useMemo<
    "checking" | "valid" | "violation" | "unavailable"
  >(() => {
    if (location.isAcquiring) return "checking";
    if (location.error) return "unavailable";
    if (location.latitude !== null && location.longitude !== null)
      return "valid";
    return "checking";
  }, [
    location.isAcquiring,
    location.error,
    location.latitude,
    location.longitude,
  ]);

  // ── Effects ──

  // Acquire GPS on mount
  useEffect(() => {
    void location.acquire();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If already clocked in, redirect to active-timer
  useEffect(() => {
    if (timeStatus?.clocked_in) {
      router.replace("/(app)/active-timer" as never);
    }
  }, [timeStatus?.clocked_in, router]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  // ── Clock In Logic ──

  const performClockIn = useCallback(
    async (pin?: string, overrideGeofence?: boolean) => {
      if (location.latitude === null || location.longitude === null) {
        showToast("error", "GPS location not available. Please wait.");
        return;
      }

      setIsClockingIn(true);
      setRingState("acquiring");

      try {
        const response = await clockIn.mutateAsync({
          latitude: location.latitude,
          longitude: location.longitude,
          job_id: targetJob?.id,
          pin,
          override_geofence: overrideGeofence,
          override_note: overrideGeofence ? overrideNote : undefined,
        });

        // Success
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
        setRingProgress(1);
        setRingState("success");
        setShowOverride(false);

        // Update clock store
        useClockStore.getState().setClockedIn({
          id: response.id,
          clock_in_time: response.clock_in_time,
          clock_in_location: {
            lat: location.latitude,
            lng: location.longitude,
          },
          job_id: response.job_id,
          job: targetJob
            ? {
                id: targetJob.id,
                title: targetJob.title,
                account_name: targetJob.account_name,
                job_number: targetJob.job_number,
              }
            : null,
          notes: null,
          elapsed_minutes: 0,
        });

        // Navigate after delay
        successTimeoutRef.current = setTimeout(() => {
          router.replace("/(app)/active-timer" as never);
        }, 1500);
      } catch (err: unknown) {
        const apiErr = err as ApiError;
        setRingState("idle");
        setRingProgress(0);

        if (apiErr.code === "ALREADY_CLOCKED_IN") {
          showToast("warning", "You are already clocked in.");
          router.replace("/(app)/active-timer" as never);
        } else if (apiErr.code === "INVALID_PIN") {
          setPinError("Invalid PIN. Please try again.");
        } else if (apiErr.code === "GEOFENCE_VIOLATION") {
          setShowOverride(true);
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Warning
          );
        } else {
          showToast("error", apiErr.message ?? "Clock in failed.");
        }
      } finally {
        setIsClockingIn(false);
      }
    },
    [
      location.latitude,
      location.longitude,
      clockIn,
      targetJob,
      overrideNote,
      showToast,
      router,
    ]
  );

  const handleFingerprintPress = useCallback(() => {
    if (isClockingIn || ringState === "success") return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    void performClockIn();
  }, [isClockingIn, ringState, performClockIn]);

  const handlePINSubmit = useCallback(
    (pin: string) => {
      setPinError(undefined);
      void performClockIn(pin);
    },
    [performClockIn]
  );

  const handleOverrideSubmit = useCallback(() => {
    if (!overrideNote.trim()) {
      showToast("warning", "Please provide a reason for the override.");
      return;
    }
    void performClockIn(undefined, true);
  }, [overrideNote, performClockIn, showToast]);

  const handleCopyGateCode = useCallback(async () => {
    if (targetJob?.gate_code) {
      await Clipboard.setStringAsync(targetJob.gate_code);
      setCopiedGateCode(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setTimeout(() => setCopiedGateCode(false), 2000);
    }
  }, [targetJob?.gate_code]);

  const handleCallPhone = useCallback(() => {
    // Placeholder: phone number would come from job/account data
    // For now, provide a no-op with toast
    showToast("info", "Phone number not available for this job.");
  }, [showToast]);

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  // ── Render ──

  const jobAddress = targetJob
    ? `${targetJob.service_address_street}, ${targetJob.service_address_city}`
    : "";

  return (
    <View className="flex-1 bg-[#F8FAF9]">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-12"
        bounces={false}
      >
        {/* ── Forest Gradient Header ── */}
        <View
          className="relative overflow-hidden rounded-b-[32px]"
          style={styles.headerBg}
        >
          {/* Decorative mint circle */}
          <View
            className="absolute w-64 h-64 rounded-full"
            style={styles.decorativeCircle}
          />

          <View
            style={{ paddingTop: insets.top + 12 }}
            className="px-6 pb-8"
          >
            {/* Top row: Back button + Title */}
            <View className="flex-row items-center mb-6">
              <Pressable
                onPress={handleGoBack}
                className="w-10 h-10 rounded-xl items-center justify-center"
                style={styles.backButton}
              >
                <FontAwesomeIcon
                  icon={faChevronLeft}
                  size={16}
                  color="#FFFFFF"
                />
              </Pressable>

              <View className="flex-1 items-center">
                <Text className="text-lg font-bold text-white">Clock In</Text>
              </View>

              {/* Spacer to balance the back button */}
              <View className="w-10" />
            </View>

            {/* Job info below title */}
            {targetJob ? (
              <View className="items-center">
                <Text
                  className="text-[10px] font-bold uppercase tracking-widest mb-1"
                  style={styles.mintLabel}
                >
                  Current Job
                </Text>
                <Text
                  className="text-xl font-bold text-white text-center"
                  numberOfLines={2}
                >
                  {targetJob.title}
                </Text>
                <View className="flex-row items-center gap-1.5 mt-2">
                  <View
                    className="w-2 h-2 rounded-full"
                    style={styles.statusDot}
                  />
                  <Text className="text-xs font-medium text-white/70">
                    Ready to start
                  </Text>
                </View>
              </View>
            ) : (
              <View className="items-center">
                <Text
                  className="text-[10px] font-bold uppercase tracking-widest mb-1"
                  style={styles.mintLabel}
                >
                  General Clock In
                </Text>
                <Text className="text-xl font-bold text-white">
                  No job assigned
                </Text>
                <View className="flex-row items-center gap-1.5 mt-2">
                  <View
                    className="w-2 h-2 rounded-full"
                    style={styles.statusDotGray}
                  />
                  <Text className="text-xs font-medium text-white/70">
                    Clock in without a job
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* ── Job Essentials Card ── */}
        {targetJob ? (
          <View className="px-5" style={styles.cardOffset}>
            <View
              className="bg-white rounded-2xl p-5"
              style={styles.essentialsCard}
            >
              {/* Client name + Job number badge */}
              <View className="flex-row items-center justify-between mb-3">
                <Text
                  className="text-lg font-bold text-gray-900 flex-1 mr-3"
                  numberOfLines={1}
                >
                  {targetJob.account_name}
                </Text>
                <View
                  className="px-2.5 py-1 rounded-lg"
                  style={styles.jobBadge}
                >
                  <Text
                    className="text-[10px] font-bold"
                    style={styles.jobBadgeText}
                  >
                    {targetJob.job_number}
                  </Text>
                </View>
              </View>

              {/* Address row */}
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2 flex-1 mr-3">
                  <FontAwesomeIcon
                    icon={faLocationDot}
                    size={14}
                    color="#9CA3AF"
                  />
                  <Text
                    className="text-sm text-gray-500 flex-1"
                    numberOfLines={1}
                  >
                    {jobAddress}
                  </Text>
                </View>

                {/* Phone button */}
                <Pressable
                  onPress={handleCallPhone}
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={styles.phoneButton}
                >
                  <FontAwesomeIcon
                    icon={faPhone}
                    size={14}
                    color="#2A5B4F"
                  />
                </Pressable>
              </View>

              {/* Time range */}
              <View className="flex-row items-center gap-2 mb-3">
                <FontAwesomeIcon
                  icon={faStopwatch}
                  size={14}
                  color="#9CA3AF"
                />
                <Text className="text-sm text-gray-500">
                  {formatTimeRange(
                    targetJob.scheduled_start,
                    targetJob.scheduled_end
                  )}
                </Text>
              </View>

              {/* Gate code section */}
              {targetJob.gate_code ? (
                <View
                  className="rounded-xl p-3 flex-row items-center justify-between"
                  style={styles.gateCodeCard}
                >
                  <View className="flex-row items-center gap-2.5">
                    <View
                      className="w-8 h-8 rounded-lg items-center justify-center"
                      style={styles.gateIconBg}
                    >
                      <FontAwesomeIcon
                        icon={faKey}
                        size={14}
                        color="#2A5B4F"
                      />
                    </View>
                    <View>
                      <Text className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">
                        Gate Code
                      </Text>
                      <Text
                        className="text-lg font-bold"
                        style={[styles.gateCodeText, styles.monoFont]}
                      >
                        {targetJob.gate_code}
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    onPress={handleCopyGateCode}
                    className="w-9 h-9 rounded-lg items-center justify-center"
                    style={styles.copyButton}
                  >
                    <FontAwesomeIcon
                      icon={copiedGateCode ? faCheck : faCopy}
                      size={14}
                      color={copiedGateCode ? "#10B981" : "#6B7280"}
                    />
                  </Pressable>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* ── Clock Ring Section ── */}
        <View
          className="items-center"
          style={targetJob ? styles.ringWithCard : styles.ringNoCard}
        >
          <ClockRing size={256} progress={ringProgress} state={ringState}>
            <Pressable
              onPress={handleFingerprintPress}
              disabled={isClockingIn || ringState === "success"}
              style={[
                styles.fingerprintButton,
                ringState === "success" && styles.fingerprintSuccess,
              ]}
            >
              {isClockingIn ? (
                <ActivityIndicator size="large" color="#B7F0AD" />
              ) : (
                <>
                  <FontAwesomeIcon
                    icon={ringState === "success" ? faCheck : faFingerprint}
                    size={40}
                    color="#B7F0AD"
                  />
                  <Text className="text-lg font-bold text-white mt-2">
                    {ringState === "success" ? "Clocked In" : "Clock In"}
                  </Text>
                  {ringState !== "success" ? (
                    <Text className="text-[10px] text-white/60 mt-0.5">
                      Tap to start
                    </Text>
                  ) : null}
                </>
              )}
            </Pressable>
          </ClockRing>

          {/* Geofence status indicator */}
          <View className="mt-4">
            <GeofenceIndicator status={geofenceStatus} />
          </View>
        </View>

        {/* ── Geofence Override Form ── */}
        {showOverride ? (
          <View className="px-5 mt-6">
            <View
              className="rounded-2xl p-4"
              style={styles.overrideCard}
            >
              <Text className="text-sm font-bold text-red-700 mb-2">
                Outside Geofence
              </Text>
              <Text className="text-xs text-red-600 mb-4 leading-5">
                You are outside the job site geofence. To proceed, please
                provide a reason for the override. Your manager will be
                notified.
              </Text>

              <TextInput
                className="bg-white rounded-xl px-4 py-3 text-sm text-gray-900 mb-4"
                style={styles.overrideInput}
                placeholder="Reason for override (required)"
                placeholderTextColor="#9CA3AF"
                value={overrideNote}
                onChangeText={setOverrideNote}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <Pressable
                onPress={handleOverrideSubmit}
                disabled={isClockingIn || !overrideNote.trim()}
                className="w-full rounded-xl py-3.5 items-center justify-center flex-row gap-2"
                style={[
                  styles.overrideButton,
                  (!overrideNote.trim() || isClockingIn) &&
                    styles.overrideButtonDisabled,
                ]}
              >
                {isClockingIn ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <FontAwesomeIcon
                      icon={faStopwatch}
                      size={16}
                      color="#FFFFFF"
                    />
                    <Text className="text-base font-bold text-white">
                      Override & Clock In
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* ── PIN Modal ── */}
      <PINModal
        visible={showPIN}
        onSubmit={handlePINSubmit}
        onCancel={() => {
          setShowPIN(false);
          setPinError(undefined);
        }}
        error={pinError}
        loading={isClockingIn}
      />
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
  mintLabel: {
    color: "#B7F0AD",
  },
  statusDot: {
    backgroundColor: "#10B981",
  },
  statusDotGray: {
    backgroundColor: "#9CA3AF",
  },
  cardOffset: {
    marginTop: -24,
  },
  essentialsCard: {
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  jobBadge: {
    backgroundColor: "rgba(42, 91, 79, 0.1)",
  },
  jobBadgeText: {
    color: "#2A5B4F",
  },
  phoneButton: {
    backgroundColor: "rgba(42, 91, 79, 0.1)",
  },
  gateCodeCard: {
    backgroundColor: "#F0F7F2",
    borderWidth: 1,
    borderColor: "rgba(183, 240, 173, 0.3)",
  },
  gateIconBg: {
    backgroundColor: "rgba(42, 91, 79, 0.1)",
  },
  gateCodeText: {
    color: "#1E4A3F",
  },
  monoFont: {
    fontFamily: Platform.select({
      ios: "JetBrains Mono",
      android: "JetBrainsMono",
      default: "monospace",
    }),
  },
  copyButton: {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
  ringWithCard: {
    marginTop: 32,
  },
  ringNoCard: {
    marginTop: 40,
  },
  fingerprintButton: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "#2A5B4F",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2A5B4F",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  fingerprintSuccess: {
    backgroundColor: "#1E4A3F",
    shadowColor: "#B7F0AD",
    shadowOpacity: 0.5,
  },
  overrideCard: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  overrideInput: {
    borderWidth: 1,
    borderColor: "#FCA5A5",
    minHeight: 80,
  },
  overrideButton: {
    backgroundColor: "#2A5B4F",
    shadowColor: "#2A5B4F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  overrideButtonDisabled: {
    opacity: 0.5,
  },
});
