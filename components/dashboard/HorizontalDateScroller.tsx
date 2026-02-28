import { useCallback, useRef, useMemo } from "react";
import { FlatList, StyleSheet } from "react-native";
import { View, Text, Pressable } from "@/tw";

interface HorizontalDateScrollerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

interface DayItemData {
  date: Date;
  dateString: string;
  dayAbbrev: string;
  dayNum: number;
  isToday: boolean;
}

const ITEM_WIDTH = 56;
const ITEM_GAP = 8;
const TOTAL_ITEM_WIDTH = ITEM_WIDTH + ITEM_GAP;
const DAY_ABBREVS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function HorizontalDateScroller({
  selectedDate,
  onDateChange,
}: HorizontalDateScrollerProps) {
  const flatListRef = useRef<FlatList>(null);
  const today = useMemo(() => new Date(), []);

  const days = useMemo<DayItemData[]>(() => {
    return Array.from({ length: 15 }, (_, i) => {
      const date = addDays(today, i - 7);
      return {
        date,
        dateString: date.toISOString().slice(0, 10),
        dayAbbrev: DAY_ABBREVS[date.getDay()] ?? "",
        dayNum: date.getDate(),
        isToday: isSameDay(date, today),
      };
    });
  }, [today]);

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: TOTAL_ITEM_WIDTH,
      offset: TOTAL_ITEM_WIDTH * index,
      index,
    }),
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: DayItemData }) => {
      const isSelected = isSameDay(item.date, selectedDate);
      const isToday = item.isToday;

      return (
        <Pressable
          onPress={() => onDateChange(item.date)}
          style={[
            styles.dayItem,
            isToday && styles.todayItem,
            isSelected && !isToday && styles.selectedItem,
          ]}
        >
          <Text
            className={`text-xs font-medium ${
              isToday
                ? "text-gray-900"
                : isSelected
                  ? "text-primary"
                  : "text-gray-400"
            }`}
          >
            {item.dayAbbrev}
          </Text>
          <Text
            className={`text-lg font-bold ${
              isToday
                ? "text-gray-900"
                : isSelected
                  ? "text-primary"
                  : "text-gray-700"
            }`}
          >
            {item.dayNum}
          </Text>
        </Pressable>
      );
    },
    [selectedDate, onDateChange]
  );

  return (
    <FlatList
      ref={flatListRef}
      data={days}
      renderItem={renderItem}
      keyExtractor={(item) => item.dateString}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={TOTAL_ITEM_WIDTH}
      decelerationRate="fast"
      getItemLayout={getItemLayout}
      initialScrollIndex={7}
      contentContainerStyle={styles.container}
      ItemSeparatorComponent={() => <View style={{ width: ITEM_GAP }} />}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  dayItem: {
    width: ITEM_WIDTH,
    height: 72,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  todayItem: {
    backgroundColor: "#B7F0AD",
    transform: [{ scale: 1.05 }],
    shadowColor: "#B7F0AD",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  selectedItem: {
    borderWidth: 2,
    borderColor: "#2A5B4F",
  },
});
