import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  Switch,
  StyleSheet,
  ScrollView,
} from "react-native";
import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth-store";
import { useLogout } from "@/hooks/useLogout";
import { useBiometric } from "@/hooks/useBiometric";
import { PendingSyncCounter } from "@/components/offline/PendingSyncCounter";
import { useSyncStore } from "@/store/sync-store";
import { formatCacheTime } from "@/lib/offline/format-cache-time";
import { useSOSAlerts } from "@/lib/api/hooks/useSOS";
import { SOSDisclaimerModal } from "@/components/sos/SOSDisclaimerModal";

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const workspace = useAuthStore((s) => s.workspace);
  const logout = useLogout();
  const biometric = useBiometric();
  const lastSyncedAt = useSyncStore((s) => s.lastSyncedAt);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const isOwner = user?.role === "OWNER";

  // Fetch SOS alert counts for owner badge (only when owner)
  const { data: sosData } = useSOSAlerts(
    isOwner ? undefined : { status: "active", limit: 0 }
  );
  const activeAlertCount = isOwner ? (sosData?.counts?.active ?? 0) : 0;

  const handleBiometricToggle = useCallback(async (value: boolean) => {
    if (value) {
      // Verify identity before enabling
      const success = await biometric.authenticate();
      if (!success) return;
    }
    await biometric.setEnabled(value);
  }, [biometric]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: logout,
        },
      ]
    );
  }, [logout]);

  return (
    <View
      className="flex-1 bg-surface"
      style={{ paddingTop: insets.top }}
    >
      {/* User Header */}
      <View className="px-6 pt-6 pb-4">
        <View className="flex-row items-center gap-4">
          <View
            className="items-center justify-center rounded-full bg-primary"
            style={styles.avatar}
          >
            <Text className="text-white text-xl font-bold">
              {user?.fullName
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() ?? "?"}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-text-primary">
              {user?.fullName ?? "User"}
            </Text>
            <Text className="text-sm text-text-secondary mt-0.5">
              {user?.email ?? ""}
            </Text>
            {workspace && (
              <View className="flex-row items-center mt-1 gap-1.5">
                <FontAwesomeIcon
                  icon="briefcase"
                  size={12}
                  color="#6B7280"
                />
                <Text className="text-xs text-text-secondary">
                  {workspace.name}
                </Text>
              </View>
            )}
          </View>
          <View
            className="px-3 py-1 rounded-full"
            style={{
              backgroundColor:
                user?.role === "OWNER"
                  ? "rgba(183,240,173,0.2)"
                  : "rgba(107,114,128,0.1)",
            }}
          >
            <Text
              className="text-xs font-semibold"
              style={{
                color: user?.role === "OWNER" ? "#2A5B4F" : "#6B7280",
              }}
            >
              {user?.role ?? "STAFF"}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
      {/* Divider */}
      <View className="h-px bg-border mx-6" />

      {/* CRM Section */}
      <View className="px-6 pt-6">
        <Text className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
          CRM
        </Text>

        {/* Clients */}
        <Pressable
          onPress={() => router.push("/accounts" as never)}
          className="flex-row items-center justify-between py-4"
        >
          <View className="flex-row items-center gap-3">
            <View
              className="items-center justify-center rounded-xl"
              style={styles.settingIcon}
            >
              <FontAwesomeIcon
                icon="building"
                size={18}
                color="#2A5B4F"
              />
            </View>
            <Text className="text-base font-medium text-text-primary">
              Clients
            </Text>
          </View>
          <FontAwesomeIcon
            icon="chevron-right"
            size={14}
            color="#9CA3AF"
          />
        </Pressable>

        <View className="h-px bg-border" />

        {/* Contacts */}
        <Pressable
          onPress={() => router.push("/contacts" as never)}
          className="flex-row items-center justify-between py-4"
        >
          <View className="flex-row items-center gap-3">
            <View
              className="items-center justify-center rounded-xl"
              style={styles.settingIcon}
            >
              <FontAwesomeIcon
                icon="address-book"
                size={18}
                color="#2A5B4F"
              />
            </View>
            <Text className="text-base font-medium text-text-primary">
              Contacts
            </Text>
          </View>
          <FontAwesomeIcon
            icon="chevron-right"
            size={14}
            color="#9CA3AF"
          />
        </Pressable>

        <View className="h-px bg-border" />

        {/* Search CRM */}
        <Pressable
          onPress={() => router.push("/crm-search" as never)}
          className="flex-row items-center justify-between py-4"
        >
          <View className="flex-row items-center gap-3">
            <View
              className="items-center justify-center rounded-xl"
              style={styles.settingIcon}
            >
              <FontAwesomeIcon
                icon="magnifying-glass"
                size={18}
                color="#2A5B4F"
              />
            </View>
            <Text className="text-base font-medium text-text-primary">
              Search CRM
            </Text>
          </View>
          <FontAwesomeIcon
            icon="chevron-right"
            size={14}
            color="#9CA3AF"
          />
        </Pressable>
      </View>

      {/* Divider between CRM and Tools */}
      <View className="h-px bg-border mx-6" />

      {/* Tools Section */}
      <View className="px-6 pt-6">
        <Text className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
          Tools
        </Text>

        {/* Calculator */}
        <Pressable
          onPress={() => router.push("/(app)/calculator" as never)}
          className="flex-row items-center justify-between py-4"
        >
          <View className="flex-row items-center gap-3">
            <View
              className="items-center justify-center rounded-xl"
              style={styles.settingIcon}
            >
              <FontAwesomeIcon
                icon="calculator"
                size={18}
                color="#2A5B4F"
              />
            </View>
            <View>
              <Text className="text-base font-medium text-text-primary">
                Calculator
              </Text>
              <Text className="text-xs text-text-secondary mt-0.5">
                Estimate pricing for any service
              </Text>
            </View>
          </View>
          <FontAwesomeIcon
            icon="chevron-right"
            size={14}
            color="#9CA3AF"
          />
        </Pressable>
      </View>

      {/* Divider between CRM and Settings */}
      <View className="h-px bg-border mx-6" />

      {/* Settings Section */}
      <View className="px-6 pt-6">
        <Text className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
          Settings
        </Text>

        {/* Biometric toggle */}
        <View className="flex-row items-center justify-between py-4">
          <View className="flex-row items-center gap-3">
            <View
              className="items-center justify-center rounded-xl"
              style={styles.settingIcon}
            >
              <FontAwesomeIcon
                icon="fingerprint"
                size={18}
                color="#2A5B4F"
              />
            </View>
            <View>
              <Text className="text-base font-medium text-text-primary">
                Biometric Login
              </Text>
              <Text className="text-xs text-text-secondary mt-0.5">
                Use fingerprint or face to sign in
              </Text>
            </View>
          </View>
          {biometric.isAvailable && (
            <Switch
              value={biometric.isEnabled}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: "#D1D5DB", true: "#B7F0AD" }}
              thumbColor="#FFFFFF"
            />
          )}
        </View>

        <View className="h-px bg-border" />

        {/* SOS Alerts — Owner only */}
        {isOwner && (
          <>
            <Pressable
              onPress={() => router.push("/(app)/sos-dashboard")}
              className="flex-row items-center justify-between py-4"
            >
              <View className="flex-row items-center gap-3">
                <View
                  className="items-center justify-center rounded-xl"
                  style={[styles.settingIcon, styles.sosIcon]}
                >
                  <FontAwesomeIcon
                    icon="shield-halved"
                    size={18}
                    color="#EF4444"
                  />
                </View>
                <View>
                  <Text className="text-base font-medium text-text-primary">
                    SOS Alerts
                  </Text>
                  <Text className="text-xs text-text-secondary mt-0.5">
                    Manage crew safety alerts
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center gap-2">
                {activeAlertCount > 0 && (
                  <View style={styles.alertBadge}>
                    <Text style={styles.alertBadgeText}>
                      {activeAlertCount}
                    </Text>
                  </View>
                )}
                <FontAwesomeIcon
                  icon="chevron-right"
                  size={14}
                  color="#9CA3AF"
                />
              </View>
            </Pressable>
            <View className="h-px bg-border" />
          </>
        )}

        {/* SOS Disclaimer — All users */}
        <Pressable
          onPress={() => setShowDisclaimer(true)}
          className="flex-row items-center justify-between py-4"
        >
          <View className="flex-row items-center gap-3">
            <View
              className="items-center justify-center rounded-xl"
              style={styles.settingIcon}
            >
              <FontAwesomeIcon
                icon="shield-halved"
                size={18}
                color="#2A5B4F"
              />
            </View>
            <Text className="text-base font-medium text-text-primary">
              SOS Disclaimer
            </Text>
          </View>
          <FontAwesomeIcon
            icon="chevron-right"
            size={14}
            color="#9CA3AF"
          />
        </Pressable>

        <View className="h-px bg-border" />

        {/* App Version */}
        <View className="flex-row items-center justify-between py-4">
          <View className="flex-row items-center gap-3">
            <View
              className="items-center justify-center rounded-xl"
              style={styles.settingIcon}
            >
              <FontAwesomeIcon
                icon="gear"
                size={18}
                color="#2A5B4F"
              />
            </View>
            <Text className="text-base font-medium text-text-primary">
              App Version
            </Text>
          </View>
          <Text className="text-sm text-text-secondary">1.0.0</Text>
        </View>

        <View className="h-px bg-border" />

        {/* Pending Sync Counter (only shows when items pending) */}
        <PendingSyncCounter />

        {/* Last Synced */}
        {lastSyncedAt && (
          <>
            <View className="h-px bg-border" />
            <View className="flex-row items-center justify-between py-4">
              <View className="flex-row items-center gap-3">
                <View
                  className="items-center justify-center rounded-xl"
                  style={styles.settingIcon}
                >
                  <FontAwesomeIcon
                    icon="cloud-arrow-up"
                    size={18}
                    color="#2A5B4F"
                  />
                </View>
                <Text className="text-base font-medium text-text-primary">
                  Last Synced
                </Text>
              </View>
              <Text className="text-sm text-text-secondary">
                {formatCacheTime(lastSyncedAt)}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Logout Button */}
      <View className="px-6 mt-6" style={{ paddingBottom: insets.bottom + 24 }}>
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.logoutButtonPressed,
          ]}
        >
          <FontAwesomeIcon
            icon="right-from-bracket"
            size={18}
            color="#EF4444"
          />
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>
      </View>
      </ScrollView>

      {/* SOS Disclaimer Modal (read-only from settings) */}
      <SOSDisclaimerModal
        visible={showDisclaimer}
        onAccept={() => setShowDisclaimer(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 56,
    height: 56,
  },
  settingIcon: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(42,91,79,0.08)",
  },
  sosIcon: {
    backgroundColor: "rgba(239,68,68,0.08)",
  },
  alertBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  alertBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
    backgroundColor: "rgba(239,68,68,0.05)",
  },
  logoutButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
  },
});
