import { useEffect, useState, useCallback } from "react";
import { StyleSheet, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faChevronLeft,
  faEllipsisVertical,
  faPause,
  faPlay,
  faCamera,
  faNoteSticky,
  faFlag,
  faRightFromBracket,
  faCircle,
  faLocationDot,
  faListCheck,
} from "@fortawesome/free-solid-svg-icons";
import {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";

import { View, Text, Pressable, ScrollView } from "@/tw";
import { AnimatedText } from "@/tw/animated";
import { useClockStore } from "@/store/clock-store";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { colors } from "@/constants/tokens";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ElapsedTime {
  hours: number;
  minutes: number;
  seconds: number;
}

interface QuickAction {
  label: string;
  icon: typeof faCamera;
  color: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDuration(e: ElapsedTime): string {
  if (e.hours > 0) return `${e.hours}h ${e.minutes}m`;
  return `${e.minutes}m ${e.seconds}s`;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const QUICK_ACTIONS: QuickAction[] = [
  { label: "Add Photo", icon: faCamera, color: colors.primary.DEFAULT },
  { label: "Add Note", icon: faNoteSticky, color: colors.primary.DEFAULT },
  { label: "Report Issue", icon: faFlag, color: colors.error },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ActiveTimerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // --- Store ---
  const clockInTime = useClockStore((s) => s.clockInTime);
  const activeJobTitle = useClockStore((s) => s.activeJobTitle);
  const activeJobAccountName = useClockStore((s) => s.activeJobAccountName);

  // --- Redirect if not clocked in ---
  useEffect(() => {
    if (!clockInTime) {
      router.replace("/(app)/(tabs)/home");
    }
  }, [clockInTime, router]);

  // --- Elapsed timer ---
  const [elapsed, setElapsed] = useState<ElapsedTime>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!clockInTime) return;

    const updateTimer = () => {
      const start = new Date(clockInTime).getTime();
      const now = Date.now();
      const diff = Math.max(0, Math.floor((now - start) / 1000));

      setElapsed({
        hours: Math.floor(diff / 3600),
        minutes: Math.floor((diff % 3600) / 60),
        seconds: diff % 60,
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [clockInTime]);

  // --- Blinking colons ---
  const colonOpacity = useSharedValue(1);

  useEffect(() => {
    colonOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      false
    );
  }, [colonOpacity]);

  const colonStyle = useAnimatedStyle(() => ({
    opacity: colonOpacity.value,
  }));

  // --- Clock-out dialog ---
  const [showClockOutConfirm, setShowClockOutConfirm] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const handleClockOutPress = useCallback(() => {
    setShowClockOutConfirm(true);
  }, []);

  const handleClockOutConfirm = useCallback(() => {
    setShowClockOutConfirm(false);
    router.push("/(app)/clock-out" as never);
  }, [router]);

  const handleClockOutCancel = useCallback(() => {
    setShowClockOutConfirm(false);
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  // Don't render if not clocked in (will redirect)
  if (!clockInTime) {
    return null;
  }

  return (
    <View className="flex-1 bg-[#F8FAF9]">
      <StatusBar barStyle="light-content" />

      {/* ================================================================ */}
      {/* HEADER                                                           */}
      {/* ================================================================ */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        {/* Decorative mint circle */}
        <View style={styles.mintDecor} />

        {/* Navigation Row */}
        <View className="flex-row items-center justify-between px-5 mb-4">
          {/* Back */}
          <Pressable
            className="w-10 h-10 rounded-xl items-center justify-center"
            style={styles.headerButton}
            onPress={handleBack}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <FontAwesomeIcon icon={faChevronLeft} size={14} color="#FFFFFF" />
          </Pressable>

          {/* Title */}
          <Text className="text-lg font-bold text-white tracking-tight">
            Active Job
          </Text>

          {/* Menu */}
          <Pressable
            className="w-10 h-10 rounded-xl items-center justify-center"
            style={styles.headerButton}
            accessibilityLabel="More options"
            accessibilityRole="button"
          >
            <FontAwesomeIcon
              icon={faEllipsisVertical}
              size={14}
              color="#FFFFFF"
            />
          </Pressable>
        </View>

        {/* Timer Banner */}
        <View className="mx-5 mb-6" style={styles.timerBanner}>
          <View className="flex-row items-center justify-between">
            {/* Left: elapsed time display */}
            <View>
              {/* Label */}
              <Text style={styles.elapsedLabel}>ELAPSED TIME</Text>

              {/* Timer digits */}
              <View className="flex-row items-baseline mt-1">
                {/* Hours */}
                <Text style={styles.timerDigitLarge}>{pad(elapsed.hours)}</Text>

                {/* Blinking colon */}
                <AnimatedText style={[styles.timerColon, colonStyle]}>
                  :
                </AnimatedText>

                {/* Minutes */}
                <Text style={styles.timerDigitLarge}>
                  {pad(elapsed.minutes)}
                </Text>

                {/* Blinking colon */}
                <AnimatedText style={[styles.timerColon, colonStyle]}>
                  :
                </AnimatedText>

                {/* Seconds (smaller, dimmer) */}
                <Text style={styles.timerDigitSmall}>
                  {pad(elapsed.seconds)}
                </Text>
              </View>
            </View>

            {/* Right: pause/play button */}
            <Pressable
              className="w-12 h-12 rounded-full bg-white items-center justify-center"
              style={styles.pauseButton}
              onPress={togglePause}
              accessibilityLabel={isPaused ? "Resume timer" : "Pause timer"}
              accessibilityRole="button"
            >
              <FontAwesomeIcon
                icon={isPaused ? faPlay : faPause}
                size={18}
                color={colors.primary.DEFAULT}
              />
            </Pressable>
          </View>
        </View>
      </View>

      {/* ================================================================ */}
      {/* SCROLLABLE CONTENT                                               */}
      {/* ================================================================ */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-40"
        showsVerticalScrollIndicator={false}
      >
        {/* Job Details Card */}
        <View className="mx-4 mt-4" style={styles.jobCard}>
          <Text className="text-lg font-bold text-gray-900">
            {activeJobTitle ?? "Untitled Job"}
          </Text>

          {activeJobAccountName ? (
            <View className="flex-row items-center mt-1">
              <FontAwesomeIcon
                icon={faLocationDot}
                size={12}
                color={colors.text.secondary}
              />
              <Text className="text-sm text-gray-500 ml-1.5">
                {activeJobAccountName}
              </Text>
            </View>
          ) : null}

          {/* Divider */}
          <View className="h-px bg-gray-100 my-4" />

          {/* Checklist placeholder */}
          <View className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-lg bg-white items-center justify-center border border-gray-100">
                <FontAwesomeIcon
                  icon={faListCheck}
                  size={16}
                  color={colors.primary.DEFAULT}
                />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-sm font-bold text-gray-700">
                  Checklist
                </Text>
                <Text className="text-xs text-gray-400 mt-0.5">
                  Coming in M-03
                </Text>
              </View>
            </View>

            {/* Progress bar placeholder */}
            <View className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={styles.progressBar}
              />
            </View>
          </View>
        </View>

        {/* Quick Actions Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-4 py-4 gap-3"
        >
          {QUICK_ACTIONS.map((action) => (
            <Pressable
              key={action.label}
              className="flex-row items-center rounded-full px-4 py-2.5 bg-white border border-gray-200"
              style={styles.quickActionChip}
              accessibilityLabel={action.label}
              accessibilityRole="button"
            >
              <FontAwesomeIcon
                icon={action.icon}
                size={14}
                color={action.color}
              />
              <Text className="text-sm font-bold text-gray-700 ml-2">
                {action.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </ScrollView>

      {/* ================================================================ */}
      {/* BOTTOM: CLOCK OUT                                                */}
      {/* ================================================================ */}
      <View
        className="absolute bottom-0 left-0 right-0 px-4 pt-3"
        style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 24) + 8 }]}
      >
        {/* Sync indicator */}
        <View className="flex-row items-center justify-center mb-3">
          <FontAwesomeIcon icon={faCircle} size={6} color={colors.success} />
          <Text className="text-[10px] text-gray-400 ml-1.5 uppercase tracking-widest font-medium">
            Synced 1m ago
          </Text>
        </View>

        {/* Clock Out button */}
        <Pressable
          className="h-14 rounded-2xl flex-row items-center justify-center bg-gray-900"
          style={styles.clockOutButton}
          onPress={handleClockOutPress}
          accessibilityLabel="Clock out"
          accessibilityRole="button"
        >
          <FontAwesomeIcon
            icon={faRightFromBracket}
            size={18}
            color="#FFFFFF"
          />
          <Text className="text-lg font-bold text-white ml-3">Clock Out</Text>
        </Pressable>
      </View>

      {/* ================================================================ */}
      {/* CONFIRM DIALOG                                                   */}
      {/* ================================================================ */}
      <ConfirmDialog
        visible={showClockOutConfirm}
        title="Clock Out?"
        message={`You've been clocked in for ${formatDuration(elapsed)}`}
        confirmLabel="Clock Out"
        cancelLabel="Keep Working"
        variant="destructive"
        onConfirm={handleClockOutConfirm}
        onCancel={handleClockOutCancel}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary.DEFAULT,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  mintDecor: {
    position: "absolute",
    top: -64,
    right: -64,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: "#B7F0AD",
    opacity: 0.08,
  },
  headerButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  timerBanner: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  elapsedLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#B7F0AD",
  },
  timerDigitLarge: {
    fontSize: 36,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "JetBrainsMono",
    letterSpacing: -1,
  },
  timerColon: {
    fontSize: 36,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "JetBrainsMono",
    marginHorizontal: 2,
  },
  timerDigitSmall: {
    fontSize: 24,
    fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
    fontFamily: "JetBrainsMono",
    letterSpacing: -1,
  },
  pauseButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  jobCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
  progressBar: {
    width: "0%",
    backgroundColor: colors.primary.DEFAULT,
  },
  quickActionChip: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  bottomBar: {
    backgroundColor: "#F8FAF9",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.04)",
  },
  clockOutButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
});
