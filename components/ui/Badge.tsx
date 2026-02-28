import { View, Text } from "@/tw";
import { cn } from "@/lib/utils";

const statusClasses = {
  success: { bg: "bg-success/15", text: "text-success" },
  warning: { bg: "bg-warning/15", text: "text-warning" },
  error: { bg: "bg-error/15", text: "text-error" },
  info: { bg: "bg-info/15", text: "text-info" },
  neutral: { bg: "bg-border", text: "text-text-secondary" },
} as const;

interface BadgeProps {
  label: string;
  status?: keyof typeof statusClasses;
  className?: string;
}

export function Badge({ label, status = "neutral", className }: BadgeProps) {
  const styles = statusClasses[status];

  return (
    <View
      className={cn(
        "px-3 py-1 rounded-[12px] flex-row items-center self-start",
        styles.bg,
        className
      )}
    >
      <Text className={cn("text-xs font-medium", styles.text)}>{label}</Text>
    </View>
  );
}
