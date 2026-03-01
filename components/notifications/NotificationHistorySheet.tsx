import React from "react";
import { Modal, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faXmark,
  faBell,
  faLocationArrow,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useJobNotifications } from "@/lib/api/hooks/useNotifications";
import { CooldownTimer } from "@/components/job-detail/CooldownTimer";
import { NotificationHistoryItem } from "@/components/notifications/NotificationHistoryItem";
import type { JobNotification } from "@/lib/api/types";

interface NotificationHistorySheetProps {
  visible: boolean;
  jobId: string;
  onClose: () => void;
}

export function NotificationHistorySheet({
  visible,
  jobId,
  onClose,
}: NotificationHistorySheetProps) {
  const insets = useSafeAreaInsets();
  const { data, isLoading } = useJobNotifications(jobId);

  const canSend = data?.can_send;
  const notifications = data?.notifications ?? [];

  const renderItem = ({ item }: { item: JobNotification }) => (
    <NotificationHistoryItem notification={item} />
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      <View className="flex-1 justify-end bg-black/40">
        <Pressable className="flex-1" onPress={onClose} />
        <View
          className="bg-white rounded-t-3xl max-h-[75%]"
          style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}
        >
          {/* Handle bar */}
          <View className="items-center pt-3 pb-2">
            <View className="w-10 h-1 rounded-full bg-gray-300" />
          </View>

          {/* Header */}
          <View className="flex-row items-center px-5 py-3">
            <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-3">
              <FontAwesomeIcon icon={faBell} size={16} color="#2A5B4F" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900">
                Notification History
              </Text>
              <Text className="text-sm text-gray-500">
                {notifications.length} notification
                {notifications.length !== 1 ? "s" : ""} sent
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <FontAwesomeIcon icon={faXmark} size={20} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Status summary */}
          {canSend && (
            <View className="mx-5 mb-3 p-3 bg-gray-50 rounded-xl">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2">
                  <FontAwesomeIcon
                    icon={faLocationArrow}
                    size={12}
                    color="#2A5B4F"
                  />
                  <Text className="text-xs font-medium text-text-primary">
                    On My Way
                  </Text>
                </View>
                {canSend.on_my_way ? (
                  <Text className="text-xs text-green-600 font-medium">
                    Available
                  </Text>
                ) : canSend.on_my_way_cooldown_until ? (
                  <CooldownTimer
                    cooldownUntil={canSend.on_my_way_cooldown_until}
                    onExpired={() => {}}
                  />
                ) : (
                  <Text className="text-xs text-gray-400">Unavailable</Text>
                )}
              </View>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <FontAwesomeIcon
                    icon={faClock}
                    size={12}
                    color="#F59E0B"
                  />
                  <Text className="text-xs font-medium text-text-primary">
                    Running Late
                  </Text>
                </View>
                <Text className="text-xs text-text-secondary">
                  {canSend.running_late_remaining_today}/3 remaining today
                </Text>
              </View>
            </View>
          )}

          {/* Notifications list */}
          {isLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="small" color="#2A5B4F" />
              <Text className="text-sm text-gray-500 mt-2">Loading...</Text>
            </View>
          ) : notifications.length === 0 ? (
            <View className="py-8 items-center">
              <FontAwesomeIcon icon={faBell} size={32} color="#D1D5DB" />
              <Text className="text-sm text-gray-400 mt-3">
                No notifications sent yet
              </Text>
            </View>
          ) : (
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              showsVerticalScrollIndicator
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 16,
  },
});
