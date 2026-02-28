import { useEffect } from "react";
import { SplashScreen } from "expo-router";
import { tokenStorage } from "@/lib/auth/token-storage";
import { TokenManager } from "@/lib/auth/token-manager";
import { useAuthStore } from "@/store/auth-store";
import { configureAuth } from "@/lib/auth/configure-auth";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/constants/api";
import { BiometricUtils } from "@/hooks/useBiometric";
import type { MeResponse } from "@/lib/api/types";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    restoreSession();
  }, []);

  return <>{children}</>;
}

async function restoreSession(): Promise<void> {
  const { setAuthenticated, setSessionRestored, setLoading } =
    useAuthStore.getState();

  configureAuth();

  try {
    setLoading(true);

    const tokens = await tokenStorage.getTokens();
    if (!tokens) {
      setSessionRestored(true);
      setLoading(false);
      await SplashScreen.hideAsync();
      return;
    }

    // Biometric gate: if biometric is enabled, require it before restoring
    const biometricEnabled = await BiometricUtils.isEnabled();
    const biometricAvailable = await BiometricUtils.isAvailable();

    if (biometricEnabled && biometricAvailable) {
      const success = await BiometricUtils.authenticate();
      if (!success) {
        // Don't clear tokens — user can retry via biometric button on login
        setSessionRestored(true);
        setLoading(false);
        await SplashScreen.hideAsync();
        return;
      }
    }

    // Check if token is expired
    const expiresAt = new Date(tokens.expiresAt).getTime();
    const now = Date.now();

    if (now >= expiresAt) {
      try {
        await TokenManager.refresh();
      } catch {
        // Refresh failed — session invalid
        await tokenStorage.clearTokens();
        setSessionRestored(true);
        setLoading(false);
        await SplashScreen.hideAsync();
        return;
      }
    }

    // Validate token by fetching user profile
    const me = await apiClient.get<MeResponse>(ENDPOINTS.ME);
    const primaryWorkspace = me.workspaces[0];

    if (primaryWorkspace) {
      setAuthenticated(
        {
          id: me.id,
          email: me.email,
          fullName: me.full_name,
          role: primaryWorkspace.role,
        },
        {
          id: primaryWorkspace.id,
          name: primaryWorkspace.name,
        }
      );
    }
  } catch {
    // Any failure — start fresh
    await tokenStorage.clearTokens();
    useAuthStore.getState().logout();
  } finally {
    useAuthStore.getState().setSessionRestored(true);
    useAuthStore.getState().setLoading(false);
    await SplashScreen.hideAsync();
  }
}
