import React, { useCallback } from "react";
import { StyleSheet } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "expo-router";

interface SystemAlert {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  route: string;
}

// Hardcoded sample alerts - will be replaced by API data in a future epic
const SAMPLE_ALERTS: SystemAlert[] = [
  {
    id: "alert-overdue-invoices",
    title: "3 invoices overdue by 30+ days",
    description:
      "Outstanding payments totaling $2,450 are overdue. Automated reminders have been sent but no response received.",
    actionLabel: "Review Overdue Invoices",
    route: "/(app)/invoices/",
  },
];

export function SystemAlerts() {
  const router = useRouter();

  const handleAlertAction = useCallback(
    (route: string) => {
      router.push(route as never);
    },
    [router]
  );

  if (SAMPLE_ALERTS.length === 0) {
    return null;
  }

  return (
    <View className="mt-5 px-4">
      {/* Section Header */}
      <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
        System Alerts
      </Text>

      {/* Alert Cards */}
      <View className="gap-3">
        {SAMPLE_ALERTS.map((alert) => (
          <View
            key={alert.id}
            className="bg-red-50 rounded-xl p-4"
            style={styles.alertBorder}
          >
            <View className="flex-row">
              {/* Icon */}
              <View className="mr-3 mt-0.5">
                <FontAwesomeIcon
                  icon={faTriangleExclamation}
                  size={16}
                  color="#EF4444"
                />
              </View>

              {/* Content */}
              <View className="flex-1">
                <Text className="text-sm font-bold text-red-800 mb-1">
                  {alert.title}
                </Text>
                <Text
                  className="text-xs text-red-600 mb-2"
                  style={styles.descriptionText}
                >
                  {alert.description}
                </Text>

                {/* Action Link */}
                <Pressable onPress={() => handleAlertAction(alert.route)}>
                  <Text
                    className="text-xs font-bold text-red-700"
                    style={styles.actionLink}
                  >
                    {alert.actionLabel}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  alertBorder: {
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  descriptionText: {
    lineHeight: 18,
  },
  actionLink: {
    textDecorationLine: "underline",
  },
});
