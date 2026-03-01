import { useEffect } from "react";
import { SplashScreen } from "expo-router";
import { tokenStorage } from "@/lib/auth/token-storage";
import { TokenManager } from "@/lib/auth/token-manager";
import { useAuthStore } from "@/store/auth-store";
import { configureAuth } from "@/lib/auth/configure-auth";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/constants/api";
import { BiometricUtils } from "@/hooks/useBiometric";
import { hydrateQueryCacheFromOffline } from "@/lib/offline/cache-hydrator";
import {
  processPendingDeepLink,
  processLastNotificationResponse,
} from "@/lib/push/deep-link-handler";
import type { ProfileResponse } from "@/lib/api/types";

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

    // Hydrate React Query cache from offline storage (instant render on cached screens)
    await hydrateQueryCacheFromOffline();

    // Validate token by fetching user profile
    const profile = await apiClient.get<ProfileResponse>(ENDPOINTS.PROFILE);

    if (profile.workspace) {
      setAuthenticated(
        {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name,
          role: profile.role,
          avatarUrl: profile.avatar_url ?? undefined,
        },
        {
          id: profile.workspace.id,
          name: profile.workspace.name,
        }
      );

      // Process any queued deep link from cold start push tap (M-09 S5)
      processPendingDeepLink();
      void processLastNotificationResponse();
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
