import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "@/store/auth-store";

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/(app)/(tabs)/home" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="workspace-selector" />
      <Stack.Screen name="setup-wizard" />
    </Stack>
  );
}
