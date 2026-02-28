import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from "react-native";
import { View, Text } from "@/tw";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useAuthStore } from "@/store/auth-store";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/constants/api";
import { TokenManager } from "@/lib/auth/token-manager";
import type { WorkspaceSwitchResponse, MeResponse } from "@/lib/api/types";
import { useToastStore } from "@/store/toast-store";

const ONBOARDING_KEY = "@cleanerhq/onboarding_complete";

export default function WorkspaceSelectorScreen() {
  const insets = useSafeAreaInsets();
  const showToast = useToastStore((s) => s.showToast);
  const workspaces = useAuthStore((s) => s.workspaces);
  const user = useAuthStore((s) => s.user);
  const [switchingId, setSwitchingId] = useState<string | null>(null);

  async function handleSelectWorkspace(ws: MeResponse["workspaces"][number]) {
    setSwitchingId(ws.id);

    try {
      const data = await apiClient.post<WorkspaceSwitchResponse>(
        ENDPOINTS.WORKSPACE_SWITCH,
        { workspace_id: ws.id }
      );

      await TokenManager.saveTokens(
        data.access_token,
        data.refresh_token,
        // Default to 1 hour if no expires_in
        (data as WorkspaceSwitchResponse & { expires_in?: number }).expires_in ?? 3600
      );

      // Check onboarding
      const onboardingComplete = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (!onboardingComplete) {
        useAuthStore.getState().setWorkspace({
          id: data.workspace.id,
          name: data.workspace.name,
        });
        router.push("/(auth)/setup-wizard");
        return;
      }

      // All clear — authenticate
      useAuthStore.getState().setAuthenticated(
        {
          id: user!.id,
          email: user!.email,
          fullName: user!.fullName,
          role: ws.role,
        },
        {
          id: data.workspace.id,
          name: data.workspace.name,
        }
      );
    } catch {
      showToast("error", "Failed to switch workspace. Please try again.");
      setSwitchingId(null);
    }
  }

  function handleJoinOrCreate() {
    Linking.openURL("https://app.cleanerhq.com");
  }

  // Find the most recently active workspace
  const sortedWorkspaces = [...(workspaces ?? [])].sort(
    (a, b) =>
      new Date(b.last_active_at).getTime() -
      new Date(a.last_active_at).getTime()
  );
  const lastActiveId = sortedWorkspaces[0]?.id;

  return (
    <View className="flex-1 bg-primary">
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 },
        ]}
      >
        {/* Header */}
        <View className="px-6 mb-6">
          <Text className="text-white text-2xl font-bold">
            Choose a workspace
          </Text>
          <Text className="text-white/60 text-sm mt-2">
            You belong to multiple organizations. Select one to continue.
          </Text>
        </View>

        {/* Workspace Cards */}
        <View className="px-6 gap-3">
          {sortedWorkspaces.map((ws) => {
            const isActive = ws.id === lastActiveId;
            const isSwitching = switchingId === ws.id;
            const isDisabled = switchingId !== null;

            return (
              <Pressable
                key={ws.id}
                onPress={() => handleSelectWorkspace(ws)}
                disabled={isDisabled}
                style={({ pressed }) => [
                  styles.workspaceCard,
                  pressed && styles.workspaceCardPressed,
                  isDisabled && !isSwitching && styles.workspaceCardDisabled,
                ]}
              >
                {/* Last Active Ribbon */}
                {isActive && (
                  <View style={styles.ribbon}>
                    <Text style={styles.ribbonText}>LAST ACTIVE</Text>
                  </View>
                )}

                <View className="flex-row items-center gap-4">
                  {/* Workspace Initial */}
                  <View
                    className="items-center justify-center rounded-2xl"
                    style={styles.wsIcon}
                  >
                    <Text className="text-primary text-lg font-bold">
                      {ws.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View className="flex-1">
                    <Text className="text-text-primary text-lg font-semibold">
                      {ws.name}
                    </Text>
                    <View className="flex-row items-center gap-3 mt-1">
                      {/* Role Badge */}
                      <View
                        className="px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor:
                            ws.role === "OWNER"
                              ? "rgba(183,240,173,0.2)"
                              : "rgba(107,114,128,0.1)",
                        }}
                      >
                        <Text
                          className="text-[10px] font-semibold"
                          style={{
                            color:
                              ws.role === "OWNER" ? "#2A5B4F" : "#6B7280",
                          }}
                        >
                          {ws.role}
                        </Text>
                      </View>

                      {/* Member Count */}
                      <View className="flex-row items-center gap-1">
                        <FontAwesomeIcon
                          icon="users"
                          size={12}
                          color="#6B7280"
                        />
                        <Text className="text-xs text-text-secondary">
                          {ws.members_count}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Loading or Chevron */}
                  {isSwitching ? (
                    <ActivityIndicator size="small" color="#2A5B4F" />
                  ) : (
                    <FontAwesomeIcon
                      icon="chevron-right"
                      size={16}
                      color="#9CA3AF"
                    />
                  )}
                </View>
              </Pressable>
            );
          })}

          {/* Join or Create */}
          <Pressable
            onPress={handleJoinOrCreate}
            disabled={switchingId !== null}
            style={({ pressed }) => [
              styles.joinButton,
              pressed && styles.joinButtonPressed,
            ]}
          >
            <FontAwesomeIcon
              icon="plus"
              size={20}
              color="rgba(255,255,255,0.5)"
            />
            <Text className="text-white/50 text-base font-medium ml-3">
              Join or Create Workspace
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  workspaceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  workspaceCardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  workspaceCardDisabled: {
    opacity: 0.5,
  },
  wsIcon: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(42,91,79,0.08)",
  },
  ribbon: {
    position: "absolute",
    top: 12,
    right: -28,
    backgroundColor: "#B7F0AD",
    paddingHorizontal: 32,
    paddingVertical: 3,
    transform: [{ rotate: "45deg" }],
  },
  ribbonText: {
    fontSize: 8,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: 1,
  },
  joinButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 64,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(255,255,255,0.2)",
  },
  joinButtonPressed: {
    opacity: 0.7,
  },
});
