import { ActivityIndicator } from "react-native";
import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCircleCheck, faTriangleExclamation, faLocationDot } from "@fortawesome/free-solid-svg-icons";

interface GeofenceIndicatorProps {
  status: "checking" | "valid" | "violation" | "unavailable";
  distanceMeters?: number;
  radiusMeters?: number;
}

export function GeofenceIndicator({
  status,
  distanceMeters,
}: GeofenceIndicatorProps) {
  if (status === "checking") {
    return (
      <View className="flex-row items-center gap-2 px-3 py-2 rounded-lg bg-gray-50">
        <ActivityIndicator size="small" color="#6B7280" />
        <Text className="text-xs font-medium text-gray-500">
          Checking location...
        </Text>
      </View>
    );
  }

  if (status === "valid") {
    return (
      <View className="flex-row items-center gap-2 px-3 py-2 rounded-lg bg-green-50">
        <FontAwesomeIcon icon={faCircleCheck} size={14} color="#10B981" />
        <Text className="text-xs font-bold text-green-700">
          GPS Verified: On Site
        </Text>
      </View>
    );
  }

  if (status === "violation") {
    return (
      <View className="flex-row items-center gap-2 px-3 py-2 rounded-lg bg-red-50">
        <FontAwesomeIcon
          icon={faTriangleExclamation}
          size={14}
          color="#EF4444"
        />
        <Text className="text-xs font-bold text-red-700">
          Outside geofence
          {distanceMeters
            ? ` (${Math.round(distanceMeters)}m away)`
            : ""}
        </Text>
      </View>
    );
  }

  // unavailable
  return (
    <View className="flex-row items-center gap-2 px-3 py-2 rounded-lg bg-gray-50">
      <FontAwesomeIcon icon={faLocationDot} size={14} color="#9CA3AF" />
      <Text className="text-xs font-medium text-gray-400">
        GPS Unavailable
      </Text>
    </View>
  );
}
