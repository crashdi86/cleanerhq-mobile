import React, { useCallback } from "react";
import { StyleSheet } from "react-native";
import { View, Text, Pressable, ScrollView } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faFileInvoiceDollar,
  faRoute,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "expo-router";

interface QuickAction {
  label: string;
  icon: typeof faFileInvoiceDollar;
  iconColor: string;
  variant: "primary" | "secondary";
  route: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "Create Quote",
    icon: faFileInvoiceDollar,
    iconColor: "#FFFFFF",
    variant: "primary",
    route: "/(app)/quotes/new",
  },
  {
    label: "Optimize Route",
    icon: faRoute,
    iconColor: "#3B82F6",
    variant: "secondary",
    route: "/(app)/(tabs)/route",
  },
  {
    label: "Message Team",
    icon: faUsers,
    iconColor: "#8B5CF6",
    variant: "secondary",
    route: "/(app)/(tabs)/messages",
  },
];

export function QuickActionsOwner() {
  const router = useRouter();

  const handlePress = useCallback(
    (route: string) => {
      router.push(route as never);
    },
    [router]
  );

  return (
    <View className="mt-5">
      {/* Section Header */}
      <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 mb-3">
        Quick Actions
      </Text>

      {/* Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-4 gap-3"
      >
        {QUICK_ACTIONS.map((action) => (
          <Pressable
            key={action.label}
            onPress={() => handlePress(action.route)}
          >
            <View
              className={`flex-row items-center gap-2 rounded-xl px-4 py-3 ${
                action.variant === "primary"
                  ? "bg-[#2A5B4F]"
                  : "bg-white"
              }`}
              style={[
                action.variant === "primary"
                  ? styles.primaryShadow
                  : styles.secondaryShadow,
                action.variant === "secondary" ? styles.secondaryBorder : undefined,
              ]}
            >
              <FontAwesomeIcon
                icon={action.icon}
                size={14}
                color={action.iconColor}
              />
              <Text
                className={`text-sm font-semibold ${
                  action.variant === "primary"
                    ? "text-white"
                    : "text-gray-700"
                }`}
              >
                {action.label}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  primaryShadow: {
    shadowColor: "#2A5B4F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  secondaryShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  secondaryBorder: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
});
