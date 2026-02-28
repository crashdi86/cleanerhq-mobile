import { useState, useMemo, useCallback } from "react";
import { StyleSheet } from "react-native";
import { View, Text, Pressable, ScrollView } from "@/tw";

interface DateRange {
  dateFrom: string;
  dateTo: string;
}

interface DateRangePickerProps {
  onRangeChange: (range: DateRange) => void;
}

type Preset = "this_week" | "last_week" | "this_month";

const PRESETS: Array<{ key: Preset; label: string }> = [
  { key: "this_week", label: "This Week" },
  { key: "last_week", label: "Last Week" },
  { key: "this_month", label: "This Month" },
];

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getMonday(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getPresetRange(preset: Preset): DateRange {
  const now = new Date();

  switch (preset) {
    case "this_week": {
      const monday = getMonday(now);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return { dateFrom: formatDate(monday), dateTo: formatDate(sunday) };
    }
    case "last_week": {
      const monday = getMonday(now);
      monday.setDate(monday.getDate() - 7);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return { dateFrom: formatDate(monday), dateTo: formatDate(sunday) };
    }
    case "this_month": {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { dateFrom: formatDate(first), dateTo: formatDate(last) };
    }
  }
}

export function DateRangePicker({ onRangeChange }: DateRangePickerProps) {
  const [activePreset, setActivePreset] = useState<Preset>("this_week");

  const displayRange = useMemo(() => {
    const range = getPresetRange(activePreset);
    const from = new Date(range.dateFrom + "T00:00:00");
    const to = new Date(range.dateTo + "T00:00:00");
    const opts: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };
    return `${from.toLocaleDateString("en-US", opts)} – ${to.toLocaleDateString("en-US", opts)}`;
  }, [activePreset]);

  const handlePreset = useCallback(
    (preset: Preset) => {
      setActivePreset(preset);
      onRangeChange(getPresetRange(preset));
    },
    [onRangeChange]
  );

  return (
    <View className="px-4 py-3">
      {/* Preset buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {PRESETS.map((p) => {
          const isActive = activePreset === p.key;
          return (
            <Pressable
              key={p.key}
              className={`px-4 py-2 rounded-full ${
                isActive
                  ? "bg-[#2A5B4F]"
                  : "bg-white border border-gray-200"
              }`}
              style={!isActive ? styles.inactiveShadow : undefined}
              onPress={() => handlePreset(p.key)}
            >
              <Text
                className={`text-xs font-bold ${
                  isActive ? "text-white" : "text-gray-600"
                }`}
              >
                {p.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Date range display */}
      <Text className="text-xs text-gray-400 font-medium mt-2">
        {displayRange}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  inactiveShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
});
