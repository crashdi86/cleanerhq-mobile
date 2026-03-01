import { View, Text } from "@/tw";

interface DateSeparatorProps {
  /** ISO date string */
  date: string;
}

/** Centered date label with lines on each side: "Today", "Yesterday", or "Feb 25" */
export function DateSeparator({ date }: DateSeparatorProps) {
  return (
    <View className="flex-row items-center px-6 py-3">
      <View className="flex-1 h-[1px] bg-gray-200" />
      <Text className="text-[11px] text-gray-400 font-semibold mx-3">
        {formatDateLabel(date)}
      </Text>
      <View className="flex-1 h-[1px] bg-gray-200" />
    </View>
  );
}

function formatDateLabel(isoDate: string): string {
  const msgDate = new Date(isoDate);
  const now = new Date();

  // Reset to midnight for comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(
    msgDate.getFullYear(),
    msgDate.getMonth(),
    msgDate.getDate(),
  );

  const diffDays = Math.round(
    (today.getTime() - target.getTime()) / 86_400_000,
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[msgDate.getMonth()]} ${msgDate.getDate()}`;
}
