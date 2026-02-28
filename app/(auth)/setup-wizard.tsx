import { useState, useRef } from "react";
import {
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Animated as RNAnimated,
  Alert,
} from "react-native";
import { View, Text } from "@/tw";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import * as Location from "expo-location";

import { useAuthStore } from "@/store/auth-store";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/constants/api";
import { useToastStore } from "@/store/toast-store";

const ONBOARDING_KEY = "@cleanerhq/onboarding_complete";
const TOTAL_STEPS = 3;

type Step = 0 | 1 | 2;

export default function SetupWizardScreen() {
  const insets = useSafeAreaInsets();
  const showToast = useToastStore((s) => s.showToast);
  const user = useAuthStore((s) => s.user);
  const workspace = useAuthStore((s) => s.workspace);
  const [currentStep, setCurrentStep] = useState<Step>(0);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [permissionLoading, setPermissionLoading] = useState(false);

  // Progress animation
  const progressAnim = useRef(new RNAnimated.Value(0)).current;

  function animateProgress(step: number) {
    RNAnimated.timing(progressAnim, {
      toValue: (step + 1) / TOTAL_STEPS,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }

  function goToStep(step: Step) {
    setCurrentStep(step);
    animateProgress(step);
  }

  async function handleComplete() {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");

    if (user && workspace) {
      useAuthStore.getState().setAuthenticated(user, workspace);
    }
  }

  function handleSkipAll() {
    Alert.alert(
      "Skip Setup",
      "You can always update these settings later.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Skip", onPress: handleComplete },
      ]
    );
  }

  // Step 0: Profile Photo
  async function handlePickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showToast("error", "Photo library access is required to set a profile picture.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    if (!asset) return;
    setAvatarUri(asset.uri);

    // Upload to server
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", {
        uri: asset.uri,
        name: "avatar.jpg",
        type: "image/jpeg",
      } as unknown as Blob);

      await apiClient.patch(ENDPOINTS.PROFILE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch {
      // Non-blocking — photo is saved locally at least
      showToast("warning", "Photo saved locally. Upload will retry later.");
    } finally {
      setUploading(false);
    }
  }

  // Step 1: Notifications
  async function handleEnableNotifications() {
    setPermissionLoading(true);
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === "granted") {
        showToast("success", "Notifications enabled!");
      } else {
        showToast("info", "You can enable notifications later in Settings.");
      }
    } catch {
      showToast("error", "Could not request notification permissions.");
    } finally {
      setPermissionLoading(false);
      goToStep(2);
    }
  }

  // Step 2: Location
  async function handleEnableLocation() {
    setPermissionLoading(true);
    try {
      const { status } =
        await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        showToast("success", "Location access enabled!");
      } else {
        showToast("info", "You can enable location later in Settings.");
      }
    } catch {
      showToast("error", "Could not request location permissions.");
    } finally {
      setPermissionLoading(false);
      handleComplete();
    }
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View className="flex-1 bg-primary">
      <StatusBar style="light" />
      <View
        className="flex-1"
        style={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}
      >
        {/* Top Bar */}
        <View className="flex-row items-center justify-between px-6 mb-4">
          {/* Step dots */}
          <View className="flex-row gap-2">
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                className="rounded-full"
                style={[
                  styles.dot,
                  i <= currentStep
                    ? styles.dotActive
                    : styles.dotInactive,
                ]}
              />
            ))}
          </View>

          {/* Skip All */}
          <Pressable onPress={handleSkipAll} hitSlop={12}>
            <Text className="text-white/50 text-sm font-medium">
              Skip All
            </Text>
          </Pressable>
        </View>

        {/* Progress Bar */}
        <View className="mx-6 mb-8" style={styles.progressTrack}>
          <RNAnimated.View
            style={[
              styles.progressFill,
              { width: progressWidth },
            ]}
          />
        </View>

        {/* Step Content */}
        <View className="flex-1 items-center justify-center px-6">
          {currentStep === 0 && (
            <StepProfilePhoto
              avatarUri={avatarUri}
              uploading={uploading}
              userName={user?.fullName ?? ""}
              onPickPhoto={handlePickPhoto}
              onNext={() => goToStep(1)}
              onSkip={() => goToStep(1)}
            />
          )}
          {currentStep === 1 && (
            <StepNotifications
              loading={permissionLoading}
              onEnable={handleEnableNotifications}
              onSkip={() => goToStep(2)}
            />
          )}
          {currentStep === 2 && (
            <StepLocation
              loading={permissionLoading}
              onEnable={handleEnableLocation}
              onSkip={handleComplete}
            />
          )}
        </View>
      </View>
    </View>
  );
}

// --- Step Components ---

function StepProfilePhoto({
  avatarUri,
  uploading,
  userName,
  onPickPhoto,
  onNext,
  onSkip,
}: {
  avatarUri: string | null;
  uploading: boolean;
  userName: string;
  onPickPhoto: () => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  return (
    <View className="items-center">
      <Pressable onPress={onPickPhoto} disabled={uploading}>
        <View style={styles.avatarCircle}>
          {avatarUri ? (
            <View
              className="w-full h-full rounded-full overflow-hidden"
              style={{ backgroundColor: "#2A5B4F" }}
            >
              {/* RN Image for local URI */}
              <RNAnimated.Image
                source={{ uri: avatarUri }}
                style={styles.avatarImage}
              />
            </View>
          ) : (
            <>
              <FontAwesomeIcon
                icon="camera"
                size={32}
                color="rgba(255,255,255,0.4)"
              />
              {uploading && (
                <View style={styles.uploadOverlay}>
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              )}
            </>
          )}
        </View>
      </Pressable>

      <Text className="text-white text-2xl font-bold mt-6">
        Add a profile photo
      </Text>
      <Text className="text-white/60 text-sm text-center mt-2 px-4">
        Help your team recognize you by adding a photo
      </Text>

      <View className="w-full mt-10 gap-3">
        {avatarUri ? (
          <Pressable
            onPress={onNext}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={onPickPhoto}
            disabled={uploading}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
              uploading && styles.primaryButtonDisabled,
            ]}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#1F2937" />
            ) : (
              <Text style={styles.primaryButtonText}>Choose Photo</Text>
            )}
          </Pressable>
        )}
        <Pressable onPress={onSkip} style={styles.skipButton}>
          <Text className="text-white/50 text-base font-medium">Skip</Text>
        </Pressable>
      </View>
    </View>
  );
}

function StepNotifications({
  loading,
  onEnable,
  onSkip,
}: {
  loading: boolean;
  onEnable: () => void;
  onSkip: () => void;
}) {
  return (
    <View className="items-center">
      <View style={styles.permissionIconCircle}>
        <FontAwesomeIcon icon="bell" size={40} color="#B7F0AD" />
      </View>

      <Text className="text-white text-2xl font-bold mt-6">
        Stay in the loop
      </Text>
      <Text className="text-white/60 text-sm text-center mt-2 px-4">
        Get notified about new jobs, schedule changes, and messages from your
        team
      </Text>

      <View className="w-full mt-10 gap-3">
        <Pressable
          onPress={onEnable}
          disabled={loading}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.primaryButtonPressed,
            loading && styles.primaryButtonDisabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#1F2937" />
          ) : (
            <Text style={styles.primaryButtonText}>Enable Notifications</Text>
          )}
        </Pressable>
        <Pressable onPress={onSkip} disabled={loading} style={styles.skipButton}>
          <Text className="text-white/50 text-base font-medium">Skip</Text>
        </Pressable>
      </View>
    </View>
  );
}

function StepLocation({
  loading,
  onEnable,
  onSkip,
}: {
  loading: boolean;
  onEnable: () => void;
  onSkip: () => void;
}) {
  return (
    <View className="items-center">
      <View style={styles.permissionIconCircle}>
        <FontAwesomeIcon icon="location-dot" size={40} color="#B7F0AD" />
      </View>

      <Text className="text-white text-2xl font-bold mt-6">
        Clock-in verification
      </Text>
      <Text className="text-white/60 text-sm text-center mt-2 px-4">
        Location access lets us verify you're at the job site when clocking in.
        Your location is never tracked outside of work.
      </Text>

      <View className="w-full mt-10 gap-3">
        <Pressable
          onPress={onEnable}
          disabled={loading}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.primaryButtonPressed,
            loading && styles.primaryButtonDisabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#1F2937" />
          ) : (
            <Text style={styles.primaryButtonText}>Enable Location</Text>
          )}
        </Pressable>
        <Pressable onPress={onSkip} disabled={loading} style={styles.skipButton}>
          <Text className="text-white/50 text-base font-medium">Skip</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 8,
    height: 8,
  },
  dotActive: {
    backgroundColor: "#B7F0AD",
  },
  dotInactive: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#B7F0AD",
  },
  avatarCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 112,
    height: 112,
    borderRadius: 56,
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 56,
  },
  permissionIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(183,240,173,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    height: 56,
    backgroundColor: "#B7F0AD",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  skipButton: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
