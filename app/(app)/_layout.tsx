import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { useAuthStore } from "@/store/auth-store";
import { useClockStatusSync } from "@/hooks/useClockStatusSync";
import { useUploadProcessor } from "@/hooks/useUploadProcessor";
import { useMutationQueueProcessor } from "@/hooks/useMutationQueueProcessor";
import { useUnreadBadge } from "@/hooks/useUnreadBadge";
import { ClockStatusIndicator } from "@/components/navigation/ClockStatusIndicator";
import { OfflineStatusBar } from "@/components/offline/OfflineStatusBar";

export default function AppLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isSessionRestored = useAuthStore((s) => s.isSessionRestored);

  // Keep clock state synced at the layout level
  useClockStatusSync();

  // Auto-process photo upload queue in background
  useUploadProcessor();

  // Auto-process offline mutation queue in background
  useMutationQueueProcessor();

  // Sync unread notification count to store for badge display
  useUnreadBadge();

  if (!isSessionRestored || isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2A5B4F" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={styles.root}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="jobs/[id]" />
        <Stack.Screen
          name="jobs/new"
          options={{
            presentation: "fullScreenModal",
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="clock-in"
          options={{
            presentation: "fullScreenModal",
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen name="active-timer" />
        <Stack.Screen
          name="clock-out"
          options={{
            presentation: "fullScreenModal",
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen name="time-history" />
        <Stack.Screen name="accounts/index" />
        <Stack.Screen name="accounts/[id]" />
        <Stack.Screen name="contacts/index" />
        <Stack.Screen name="crm-search" />
        <Stack.Screen name="sos-dashboard" />
        <Stack.Screen name="sos-detail" />
        <Stack.Screen name="notifications" />
        <Stack.Screen
          name="annotate"
          options={{
            presentation: "fullScreenModal",
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="camera"
          options={{
            presentation: "fullScreenModal",
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="photo-review"
          options={{
            presentation: "fullScreenModal",
            animation: "slide_from_bottom",
          }}
        />
      </Stack>
      <ClockStatusIndicator />
      <OfflineStatusBar />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAF9",
  },
});
