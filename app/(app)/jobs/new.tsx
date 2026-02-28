import React from "react";
import { StyleSheet, StatusBar } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { View, Text, Pressable, ScrollView } from "@/tw";
import { useAuthStore } from "@/store/auth-store";
import { showToast } from "@/store/toast-store";
import { JobCreationForm } from "@/components/job-creation/JobCreationForm";
import type { JobDetail } from "@/lib/api/types";

export default function NewJobScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);

  if (user?.role !== "OWNER") {
    return <Redirect href="/(app)/(tabs)/home" />;
  }

  function handleSuccess(job: JobDetail) {
    showToast("success", "Job created");
    router.replace(`/(app)/jobs/${job.id}` as never);
  }

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(app)/(tabs)/home" as never);
    }
  }

  return (
    <View className="flex-1 bg-surface-light">
      <StatusBar barStyle="light-content" />

      {/* Forest gradient header */}
      <View
        className="bg-primary rounded-b-[32px]"
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <View className="flex-row items-center px-4 pb-5">
          <Pressable
            onPress={handleBack}
            className="w-10 h-10 rounded-full bg-white/10 items-center justify-center mr-3"
          >
            <FontAwesomeIcon icon={faArrowLeft} size={18} color="#FFFFFF" />
          </Pressable>
          <Text className="text-xl font-semibold text-white flex-1">
            Create Job
          </Text>
        </View>
      </View>

      {/* Form content */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-10"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="pt-6">
          <JobCreationForm onSuccess={handleSuccess} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    shadowOpacity: 0.15,
    shadowColor: "#2A5B4F",
    elevation: 8,
  },
});
