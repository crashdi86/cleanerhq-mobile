import { useState, useMemo, useCallback } from "react";
import { StyleSheet, SectionList, ActivityIndicator } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { faClockFour as faClockRegular } from "@fortawesome/free-regular-svg-icons";
import { useTimeEntries } from "@/lib/api/hooks/useTimeTracking";
import { DateRangePicker } from "@/components/time/DateRangePicker";
import { TimeEntryCard } from "@/components/time/TimeEntryCard";
import { Skeleton } from "@/components/ui/Skeleton";
import type { TimeEntry } from "@/lib/api/types";

interface DateRange {
  dateFrom: string;
  dateTo: string;
}

interface SectionData {
  title: string;
  data: TimeEntry[];
}

function getDefaultRange(): DateRange {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    dateFrom: monday.toISOString().slice(0, 10),
    dateTo: sunday.toISOString().slice(0, 10),
  };
}

function groupByDate(entries: TimeEntry[]): SectionData[] {
  const groups = new Map<string, TimeEntry[]>();

  for (const entry of entries) {
    const dateKey = entry.clock_in_time.slice(0, 10);
    const existing = groups.get(dateKey);
    if (existing) {
      existing.push(entry);
    } else {
      groups.set(dateKey, [entry]);
    }
  }

  // Sort by date descending
  const sortedKeys = Array.from(groups.keys()).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return sortedKeys.map((key) => {
    const date = new Date(key + "T00:00:00");
    const title = date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
    return {
      title,
      data: groups.get(key) ?? [],
    };
  });
}

function LoadingSkeleton() {
  return (
    <View className="px-4 pt-4 gap-3">
      {[1, 2, 3].map((i) => (
        <View key={i} className="bg-white rounded-2xl p-4 gap-3">
          <View className="flex-row justify-between">
            <Skeleton width={80} height={24} />
            <Skeleton width={60} height={20} />
          </View>
          <View className="flex-row gap-4">
            <Skeleton width={70} height={14} />
            <Skeleton width={70} height={14} />
          </View>
          <Skeleton width={180} height={14} />
        </View>
      ))}
    </View>
  );
}

function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center py-20 px-8">
      <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
        <FontAwesomeIcon icon={faClockRegular} size={24} color="#9CA3AF" />
      </View>
      <Text className="text-lg font-bold text-gray-900 mb-1 text-center">
        No time entries
      </Text>
      <Text className="text-sm text-gray-500 text-center">
        Your time entries for this period will appear here
      </Text>
    </View>
  );
}

export default function TimeHistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [range, setRange] = useState<DateRange>(getDefaultRange);

  const { data, isLoading, isRefetching, refetch } = useTimeEntries(
    range.dateFrom,
    range.dateTo
  );

  const sections = useMemo(() => {
    if (!data) return [];
    const entries = Array.isArray(data) ? data : [];
    return groupByDate(entries);
  }, [data]);

  const totalHours = useMemo(() => {
    if (!data || !Array.isArray(data)) return 0;
    const totalMins = data.reduce(
      (sum: number, e: TimeEntry) => sum + (e.total_minutes ?? 0),
      0
    );
    return Math.round((totalMins / 60) * 10) / 10;
  }, [data]);

  const handleRangeChange = useCallback((newRange: DateRange) => {
    setRange(newRange);
  }, []);

  return (
    <View className="flex-1 bg-[#F8FAF9]">
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        {/* Decorative mint circle */}
        <View
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full"
          style={styles.decorCircle}
        />

        <View className="flex-row items-center justify-between px-4 pb-4">
          <Pressable
            className="w-10 h-10 rounded-xl items-center justify-center"
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <FontAwesomeIcon icon={faChevronLeft} size={16} color="#fff" />
          </Pressable>

          <Text className="text-lg font-bold text-white">Time History</Text>

          {/* Total hours summary */}
          <View className="items-end">
            <Text className="text-[10px] text-white/60 font-medium uppercase">
              Total
            </Text>
            <Text className="text-sm font-bold text-white">
              {totalHours}h
            </Text>
          </View>
        </View>
      </View>

      {/* Date range picker */}
      <DateRangePicker onRangeChange={handleRangeChange} />

      {/* Entries list */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : sections.length === 0 ? (
        <EmptyState />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="px-4">
              <TimeEntryCard entry={item} />
            </View>
          )}
          renderSectionHeader={({ section }) => (
            <View className="px-4 pt-4 pb-2">
              <Text className="text-sm font-bold text-gray-500">
                {section.title}
              </Text>
            </View>
          )}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#2A5B4F",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
    position: "relative",
  },
  headerButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  decorCircle: {
    backgroundColor: "rgba(183,240,173,0.08)",
  },
});
