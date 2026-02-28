import { useState, useEffect, useCallback } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { View, Text } from "@/tw";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Input } from "@/components/ui/Input";
import { useApiMutation } from "@/lib/api/hooks";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/constants/api";
import { TokenManager } from "@/lib/auth/token-manager";
import { tokenStorage } from "@/lib/auth/token-storage";
import { useAuthStore } from "@/store/auth-store";
import { getErrorMessage } from "@/constants/error-messages";
import { useBiometric } from "@/hooks/useBiometric";
import type { LoginResponse, MeResponse } from "@/lib/api/types";

const ONBOARDING_KEY = "@cleanerhq/onboarding_complete";

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [biometricVisible, setBiometricVisible] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const biometric = useBiometric();

  // Check if biometric login is possible (enabled + tokens exist)
  useEffect(() => {
    (async () => {
      const enabled = await biometric.checkEnabled();
      if (!enabled) return;
      const tokens = await tokenStorage.getTokens();
      setBiometricVisible(!!tokens);
    })();
  }, [biometric.checkEnabled]);

  const handleBiometricLogin = useCallback(async () => {
    setBiometricLoading(true);
    try {
      const success = await biometric.authenticate();
      if (!success) {
        setBiometricLoading(false);
        return;
      }

      // Restore session from stored tokens
      const tokens = await tokenStorage.getTokens();
      if (!tokens) {
        setLoginError("No saved session. Please sign in with your password.");
        setBiometricLoading(false);
        return;
      }

      // Check if token is expired and refresh if needed
      const expiresAt = new Date(tokens.expiresAt).getTime();
      if (Date.now() >= expiresAt) {
        try {
          await TokenManager.refresh();
        } catch {
          setLoginError("Session expired. Please sign in again.");
          setBiometricLoading(false);
          return;
        }
      }

      // Validate token
      const me = await apiClient.get<MeResponse>(ENDPOINTS.ME);
      const ws = me.workspaces[0];
      if (ws) {
        useAuthStore.getState().setAuthenticated(
          {
            id: me.id,
            email: me.email,
            fullName: me.full_name,
            role: ws.role,
          },
          { id: ws.id, name: ws.name }
        );
      }
    } catch {
      setLoginError("Biometric login failed. Please sign in with your password.");
    } finally {
      setBiometricLoading(false);
    }
  }, [biometric]);

  const loginMutation = useApiMutation<
    LoginResponse,
    { email: string; password: string }
  >(
    (vars) =>
      apiClient.post<LoginResponse>(ENDPOINTS.LOGIN, vars, {
        authenticated: false,
      }),
    {
      onSuccess: async (data) => {
        setLoginError("");

        // Save tokens
        await TokenManager.saveTokens(
          data.access_token,
          data.refresh_token,
          data.expires_in
        );

        const { user } = data;
        const userObj = {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
        };

        // Set user in store (not authenticated yet for multi-workspace case)
        useAuthStore.getState().setUser(userObj);

        // Check for multiple workspaces
        try {
          const me = await apiClient.get<MeResponse>(ENDPOINTS.ME);

          if (me.workspaces.length > 1) {
            useAuthStore.getState().setWorkspaces(me.workspaces);
            router.push("/(auth)/workspace-selector");
            return;
          }

          // Single workspace — check onboarding
          const onboardingComplete = await AsyncStorage.getItem(ONBOARDING_KEY);
          if (!onboardingComplete) {
            useAuthStore.getState().setWorkspace({
              id: user.workspace.id,
              name: user.workspace.name,
            });
            router.push("/(auth)/setup-wizard");
            return;
          }

          // All clear — set authenticated
          useAuthStore.getState().setAuthenticated(userObj, {
            id: user.workspace.id,
            name: user.workspace.name,
          });
        } catch {
          // Fallback: use workspace from login response
          useAuthStore.getState().setAuthenticated(userObj, {
            id: user.workspace.id,
            name: user.workspace.name,
          });
        }
      },
      onError: (error) => {
        if (error.code === "INVALID_CREDENTIALS") {
          setLoginError(getErrorMessage("INVALID_CREDENTIALS"));
        } else if (error.code === "RATE_LIMITED") {
          setLoginError(getErrorMessage("RATE_LIMITED"));
        } else {
          setLoginError(error.message || "Something went wrong");
        }
      },
    }
  );

  function handleSubmit() {
    setLoginError("");
    setEmailError("");

    if (!validateEmail(email.trim())) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (!password) {
      setLoginError("Please enter your password");
      return;
    }

    loginMutation.mutate({
      email: email.trim().toLowerCase(),
      password,
    });
  }

  const isLoading = loginMutation.isPending;

  return (
    <View className="flex-1 bg-primary">
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Branded Header */}
          <View className="items-center mb-8">
            <Text className="text-4xl font-bold text-white tracking-tight">
              CleanerHQ
            </Text>
            <Text className="text-sm text-mint mt-2">
              Field Operations Made Simple
            </Text>
          </View>

          {/* Glass Card */}
          <View
            className="mx-6 rounded-[24px] p-8"
            style={styles.glassCard}
          >
            {/* Email */}
            <Input
              variant="glass"
              placeholder="Email address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError("");
              }}
              error={emailError}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              leftIcon={
                <FontAwesomeIcon
                  icon="envelope"
                  size={20}
                  color="rgba(255,255,255,0.5)"
                />
              }
            />

            {/* Password */}
            <View className="mt-4">
              <Input
                variant="glass"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                leftIcon={
                  <FontAwesomeIcon
                    icon="lock"
                    size={20}
                    color="rgba(255,255,255,0.5)"
                  />
                }
                rightIcon={
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={8}
                  >
                    <FontAwesomeIcon
                      icon={showPassword ? "eye-slash" : "eye"}
                      size={20}
                      color="rgba(255,255,255,0.5)"
                    />
                  </Pressable>
                }
              />
            </View>

            {/* Login Error */}
            {loginError ? (
              <View className="mt-3 flex-row items-center gap-2">
                <FontAwesomeIcon
                  icon="circle-xmark"
                  size={14}
                  color="#EF4444"
                />
                <Text className="text-red-400 text-sm flex-1">
                  {loginError}
                </Text>
              </View>
            ) : null}

            {/* Sign In Button */}
            <Pressable
              onPress={handleSubmit}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.signInButton,
                pressed && styles.signInButtonPressed,
                isLoading && styles.signInButtonDisabled,
              ]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#1F2937" />
              ) : (
                <Text
                  style={styles.signInButtonText}
                >
                  Sign In
                </Text>
              )}
            </Pressable>

            {/* Biometric Button */}
            {biometricVisible && (
              <View className="items-center mt-6">
                <Pressable
                  style={styles.biometricButton}
                  onPress={handleBiometricLogin}
                  disabled={biometricLoading || isLoading}
                >
                  {biometricLoading ? (
                    <ActivityIndicator size="small" color="rgba(255,255,255,0.8)" />
                  ) : (
                    <FontAwesomeIcon
                      icon="fingerprint"
                      size={28}
                      color="rgba(255,255,255,0.8)"
                    />
                  )}
                </Pressable>
              </View>
            )}

            {/* Forgot Password */}
            <Pressable
              onPress={() => router.push("/(auth)/forgot-password")}
              className="mt-4 items-center"
            >
              <Text className="text-mint text-sm font-medium">
                Forgot password?
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  glassCard: {
    backgroundColor: "rgba(42,91,79,0.95)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  signInButton: {
    height: 56,
    backgroundColor: "#B7F0AD",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  signInButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  signInButtonDisabled: {
    opacity: 0.7,
  },
  signInButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  biometricButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
});
