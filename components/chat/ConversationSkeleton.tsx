import { View } from "@/tw";
import { Skeleton } from "@/components/ui/Skeleton";

/** 4 skeleton placeholder cards matching ConversationCard dimensions */
export function ConversationSkeleton() {
  return (
    <View className="px-4 gap-3 pt-2">
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          className="bg-white rounded-[16px] px-4 py-3 flex-row items-center"
        >
          {/* Avatar skeleton */}
          <Skeleton width={48} height={48} borderRadius={24} />

          {/* Text content */}
          <View className="flex-1 ml-3">
            {/* Title row */}
            <View className="flex-row items-center justify-between mb-2">
              <Skeleton width={120} height={14} borderRadius={4} />
              <Skeleton width={28} height={12} borderRadius={4} />
            </View>
            {/* Preview */}
            <Skeleton height={12} borderRadius={4} className="mb-2" />
            {/* Badge */}
            <Skeleton width={56} height={16} borderRadius={8} />
          </View>
        </View>
      ))}
    </View>
  );
}
