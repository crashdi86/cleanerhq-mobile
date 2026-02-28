import React from "react";
import { View } from "@/tw";
import { Skeleton } from "@/components/ui/Skeleton";

export function JobDetailSkeleton() {
  return (
    <View className="flex-1 bg-[#F8FAF9]">
      {/* Header skeleton */}
      <Skeleton width="100%" height={160} borderRadius={0} />

      {/* Arrival card skeleton */}
      <View className="mx-4 mt-4">
        <Skeleton width="100%" height={144} borderRadius={16} />
      </View>

      {/* Tab bar skeleton */}
      <View className="mx-4 mt-4">
        <Skeleton width="100%" height={40} borderRadius={12} />
      </View>

      {/* Detail rows skeleton */}
      <View className="mx-4 mt-4 bg-white rounded-2xl px-4 py-4 gap-4">
        <View className="gap-2">
          <Skeleton width={80} height={12} borderRadius={4} />
          <Skeleton width="70%" height={16} borderRadius={4} />
        </View>
        <View className="gap-2">
          <Skeleton width={100} height={12} borderRadius={4} />
          <Skeleton width="85%" height={16} borderRadius={4} />
        </View>
        <View className="gap-2">
          <Skeleton width={120} height={12} borderRadius={4} />
          <Skeleton width="60%" height={16} borderRadius={4} />
        </View>
        <View className="gap-2">
          <Skeleton width={60} height={12} borderRadius={4} />
          <Skeleton width="50%" height={16} borderRadius={4} />
        </View>
        <View className="gap-2">
          <Skeleton width={90} height={12} borderRadius={4} />
          <Skeleton width="90%" height={16} borderRadius={4} />
        </View>
      </View>
    </View>
  );
}
