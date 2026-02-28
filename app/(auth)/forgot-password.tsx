import { useState, useRef, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Animated as RNAnimated,
  Linking,
} from "react-native";
import { View, Text } from "@/tw";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Input } from "@/components/ui/Input";
import { useApiMutation } from "@/lib/api/hooks";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/constants/api";
import { getErrorMessage } from "@/constants/error-messages";
import type { ForgotPasswordResponse } from "@/lib/api/types";
import { useToastStore } from "@/store/toast-store";

type ScreenState = "idle" | "submitting" | "success";

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const showToast = useToastStore((s) => s.showToast);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [screenState, setScreenState] = useState<ScreenState>("idle");

  // Animation for success state
  const scaleAnim = useRef(new RNAnimated.Value(0)).current;
  const opacityAnim = useRef(new RNAnimated.Value(0)).current;
  const ringAnim = useRef(new RNAnimated.Value(1)).current;
  const ringOpacity = useRef(new RNAnimated.Value(0.6)).current;

  useEffect(() => {
    if (screenState === "success") {
      RNAnimated.parallel([
        RNAnimated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
        RNAnimated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Pulsing ring animation
      RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.parallel([
            RNAnimated.timing(ringAnim, {
              toValue: 1.6,
              duration: 1200,
              useNativeDriver: true,
            }),
            RNAnimated.timing(ringOpacity, {
              toValue: 0,
              duration: 1200,
              useNativeDriver: true,
            }),
          ]),
          RNAnimated.parallel([
            RNAnimated.timing(ringAnim, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
            RNAnimated.timing(ringOpacity, {
              toValue: 0.6,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    }
  }, [screenState, scaleAnim, opacityAnim, ringAnim, ringOpacity]);

  const forgotMutation = useApiMutation<
    ForgotPasswordResponse,
    { email: string }
  >(
    (vars) =>
      apiClient.post<ForgotPasswordResponse>(ENDPOINTS.FORGOT_PASSWORD, vars, {
        authenticated: false,
      }),
    {
      onSuccess: () => {
        setScreenState("success");
      },
      onError: (error) => {
        if (error.code === "RATE_LIMITED") {
          showToast("error", getErrorMessage("RATE_LIMITED"));
          setScreenState("idle");
        } else {
          // Anti-enumeration: show success regardless
          setScreenState("success");
        }
      },
    }
  );

  function handleSubmit() {
    setEmailError("");

    if (!validateEmail(email.trim())) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setScreenState("submitting");
    forgotMutation.mutate({ email: email.trim().toLowerCase() });
  }

  function handleOpenEmail() {
    Linking.openURL("mailto:");
  }

  const isSubmitting = screenState === "submitting";

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
            { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={12}
          >
            <FontAwesomeIcon
              icon="arrow-left"
              size={20}
              color="rgba(255,255,255,0.8)"
            />
            <Text className="text-white/80 text-base ml-2">
              Back to Login
            </Text>
          </Pressable>

          {screenState === "success" ? (
            /* Success State */
            <RNAnimated.View
              style={[
                styles.successContainer,
                {
                  opacity: opacityAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              {/* Pulsing Ring */}
              <View style={styles.iconContainer}>
                <RNAnimated.View
                  style={[
                    styles.pulsingRing,
                    {
                      opacity: ringOpacity,
                      transform: [{ scale: ringAnim }],
                    },
                  ]}
                />
                <View style={styles.successIconCircle}>
                  <FontAwesomeIcon
                    icon="circle-check"
                    size={48}
                    color="#B7F0AD"
                  />
                </View>
              </View>

              <Text className="text-white text-2xl font-bold text-center mt-8">
                Check your email
              </Text>
              <Text className="text-white/60 text-base text-center mt-3 px-8">
                We sent a password reset link to{"\n"}
                <Text className="text-mint font-semibold">
                  {email.trim().toLowerCase()}
                </Text>
              </Text>

              {/* Open Email Button */}
              <Pressable
                onPress={handleOpenEmail}
                style={({ pressed }) => [
                  styles.openEmailButton,
                  pressed && styles.openEmailButtonPressed,
                ]}
              >
                <FontAwesomeIcon
                  icon="envelope"
                  size={18}
                  color="#1F2937"
                />
                <Text style={styles.openEmailText}>Open Email App</Text>
              </Pressable>

              <Text className="text-white/40 text-xs text-center mt-4">
                Didn't receive an email? Check your spam folder.
              </Text>
            </RNAnimated.View>
          ) : (
            /* Form State */
            <>
              {/* Icon Header */}
              <View className="items-center mb-6 mt-8">
                <View style={styles.keyIconCircle}>
                  <FontAwesomeIcon
                    icon="key"
                    size={40}
                    color="rgba(255,255,255,0.3)"
                  />
                </View>
              </View>

              {/* Glass Card */}
              <View
                className="mx-6 rounded-[24px] p-8"
                style={styles.glassCard}
              >
                <Text className="text-white text-xl font-bold text-center">
                  Forgot your password?
                </Text>
                <Text className="text-white/60 text-sm text-center mt-2 mb-6">
                  Enter your email and we'll send you a reset link
                </Text>

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

                {/* Submit Button */}
                <Pressable
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  style={({ pressed }) => [
                    styles.submitButton,
                    pressed && styles.submitButtonPressed,
                    isSubmitting && styles.submitButtonDisabled,
                  ]}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#1F2937" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      Send Reset Link
                    </Text>
                  )}
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  glassCard: {
    backgroundColor: "rgba(42,91,79,0.95)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  keyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButton: {
    height: 56,
    backgroundColor: "#B7F0AD",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  submitButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  successContainer: {
    alignItems: "center",
    paddingTop: 60,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  pulsingRing: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: "#B7F0AD",
  },
  successIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(183,240,173,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  openEmailButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 52,
    backgroundColor: "#B7F0AD",
    borderRadius: 16,
    paddingHorizontal: 32,
    marginTop: 32,
  },
  openEmailButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  openEmailText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
});
