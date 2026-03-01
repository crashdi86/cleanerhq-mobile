import { useState, useEffect } from "react";
import { StyleSheet } from "react-native";
import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";

interface CooldownTimerProps {
  cooldownUntil: string;
  onExpired: () => void;
}

function getRemainingMs(until: string): number {
  return Math.max(0, new Date(until).getTime() - Date.now());
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function CooldownTimer({ cooldownUntil, onExpired }: CooldownTimerProps) {
  const [remainingMs, setRemainingMs] = useState(() =>
    getRemainingMs(cooldownUntil)
  );

  useEffect(() => {
    const update = () => {
      const ms = getRemainingMs(cooldownUntil);
      setRemainingMs(ms);
      if (ms <= 0) {
        onExpired();
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [cooldownUntil, onExpired]);

  if (remainingMs <= 0) return null;

  return (
    <View className="flex-row items-center justify-center gap-2">
      <FontAwesomeIcon icon={faClock} size={14} color="#6B7280" />
      <Text className="text-sm text-text-secondary">
        Available in{" "}
      </Text>
      <Text style={styles.timer}>{formatCountdown(remainingMs)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  timer: {
    fontFamily: "JetBrainsMono-Medium",
    fontSize: 14,
    color: "#2A5B4F",
    fontWeight: "600",
  },
});
