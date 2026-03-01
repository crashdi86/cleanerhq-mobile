import { View, Text } from "@/tw";
import { cn } from "@/lib/utils";
import type { ConversationType } from "@/lib/api/types";

interface ConversationTypeBadgeProps {
  type: ConversationType;
  /** Job number to display (e.g. "JOB-0042") — only for job type */
  jobNumber?: string;
  className?: string;
}

/** Small pill badge: "Direct" (neutral) or "Job: JOB-0042" (primary tint) */
export function ConversationTypeBadge({
  type,
  jobNumber,
  className,
}: ConversationTypeBadgeProps) {
  const isJob = type === "job";

  return (
    <View
      className={cn(
        "px-2 py-0.5 rounded-full",
        isJob ? "bg-primary/10" : "bg-gray-100",
        className,
      )}
    >
      <Text
        className={cn(
          "text-[10px] font-semibold",
          isJob ? "text-primary" : "text-gray-500",
        )}
        numberOfLines={1}
      >
        {isJob ? `Job: ${jobNumber ?? ""}` : "Direct"}
      </Text>
    </View>
  );
}
