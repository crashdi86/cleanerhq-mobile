import React, { useState, useCallback, useMemo } from "react";
import { RefreshControl } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, ScrollView } from "@/tw";
import { useJobDetail } from "@/lib/api/hooks/useJobDetail";
import { useChecklist } from "@/lib/api/hooks/useChecklist";
import { useJobNotifications } from "@/lib/api/hooks/useNotifications";
import { JobDetailHeader } from "@/components/job-detail/JobDetailHeader";
import { ArrivalCard } from "@/components/job-detail/ArrivalCard";
import { ProfitGuardBadge } from "@/components/job-detail/ProfitGuardBadge";
import { JobTabBar } from "@/components/job-detail/JobTabBar";
import { DetailsTab } from "@/components/job-detail/DetailsTab";
import { ChecklistTab } from "@/components/job-detail/ChecklistTab";
import { PhotosTab } from "@/components/job-detail/PhotosTab";
import { NotesTab } from "@/components/job-detail/NotesTab";
import { SpecialInstructionsCard } from "@/components/job-detail/SpecialInstructionsCard";
import { BottomActionBar } from "@/components/job-detail/BottomActionBar";
import { IncompleteItemsSheet } from "@/components/checklist/IncompleteItemsSheet";
import { RunningLateSheet } from "@/components/notifications/RunningLateSheet";
import { NotificationHistorySheet } from "@/components/notifications/NotificationHistorySheet";
import { SOSFloatingButton } from "@/components/sos/SOSFloatingButton";
import { SOSDisclaimerModal } from "@/components/sos/SOSDisclaimerModal";
import { SOSCountdownModal } from "@/components/sos/SOSCountdownModal";
import { useSOSTrigger } from "@/hooks/useSOSTrigger";
import { JobDetailSkeleton } from "@/components/job-detail/JobDetailSkeleton";
import { JobDetailError } from "@/components/job-detail/JobDetailError";
import type { ChecklistItem } from "@/lib/api/types";

type TabKey = "details" | "checklist" | "photos" | "notes";

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useJobDetail(id ?? "");
  const [activeTab, setActiveTab] = useState<TabKey>("details");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showIncompleteSheet, setShowIncompleteSheet] = useState(false);
  const [showRunningLate, setShowRunningLate] = useState(false);
  const [showNotificationHistory, setShowNotificationHistory] = useState(false);

  // Fetch checklist for gating sheet
  const { data: checklistData } = useChecklist(id ?? "");

  // Fetch notification can_send state for Running Late remaining count
  const { data: notificationsData } = useJobNotifications(id ?? "");
  const runningLateRemaining =
    notificationsData?.can_send?.running_late_remaining_today ?? 3;

  // SOS trigger orchestration
  const sos = useSOSTrigger(id ?? "");

  // Compute incomplete required items for the gating sheet
  const incompleteRequiredItems = useMemo(() => {
    if (!checklistData) return [];
    return checklistData.items
      .filter((item) => item.required && !item.completed)
      .map((item) => ({
        ...item,
        room: item.room ?? item.category ?? "General",
      }));
  }, [checklistData]);

  const handleChecklistGatePress = useCallback(() => {
    setShowIncompleteSheet(true);
  }, []);

  const handleIncompleteItemPress = useCallback(
    (_itemId: string) => {
      // Switch to checklist tab — scroll-to integration handled later
      setActiveTab("checklist");
      setShowIncompleteSheet(false);
    },
    []
  );

  const handleGoToChecklist = useCallback(() => {
    setActiveTab("checklist");
    setShowIncompleteSheet(false);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  if (isLoading) {
    return <JobDetailSkeleton />;
  }

  if (isError || !data) {
    return (
      <JobDetailError
        message={
          error instanceof Error
            ? error.message
            : "Failed to load job details"
        }
        onRetry={() => void refetch()}
      />
    );
  }

  // Capture to const so TypeScript knows it's defined in nested functions
  const job = data;

  function renderTabContent() {
    switch (activeTab) {
      case "details":
        return <DetailsTab job={job} />;
      case "checklist":
        return <ChecklistTab jobId={job.id} jobStatus={job.status} />;
      case "photos":
        return <PhotosTab photos={job.photos} jobId={job.id} />;
      case "notes":
        return <NotesTab jobId={job.id} />;
    }
  }

  return (
    <View className="flex-1 bg-[#F8FAF9]">
      <JobDetailHeader
        title={job.title}
        status={job.status}
        jobNumber={job.job_number}
        onBack={() => router.back()}
      />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void handleRefresh()}
            tintColor="#2A5B4F"
            colors={["#2A5B4F"]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <ArrivalCard
          serviceAddress={job.service_address}
          clientContact={job.client_contact}
        />

        <ProfitGuardBadge job={job} />

        <JobTabBar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as TabKey)}
          badges={{ photos: job.photos.length }}
        />

        {renderTabContent()}

        <SpecialInstructionsCard job={job} />

        {/* Bottom padding to clear action bar */}
        <View className="pb-32" />
      </ScrollView>

      {/* SOS floating button — only during in_progress */}
      {job.status === "in_progress" && (
        <SOSFloatingButton onPress={sos.triggerSOS} />
      )}

      {/* Fixed bottom action bar */}
      <BottomActionBar
        job={job}
        onChecklistGatePress={handleChecklistGatePress}
        onRunningLatePress={() => setShowRunningLate(true)}
        onNotificationHistoryPress={() => setShowNotificationHistory(true)}
      />

      {/* Incomplete items sheet (completion gating) */}
      <IncompleteItemsSheet
        visible={showIncompleteSheet}
        items={incompleteRequiredItems}
        onClose={() => setShowIncompleteSheet(false)}
        onItemPress={handleIncompleteItemPress}
        onGoToChecklist={handleGoToChecklist}
      />

      {/* Running Late bottom sheet */}
      <RunningLateSheet
        visible={showRunningLate}
        jobId={job.id}
        remainingToday={runningLateRemaining}
        onClose={() => setShowRunningLate(false)}
      />

      {/* Notification history */}
      <NotificationHistorySheet
        visible={showNotificationHistory}
        jobId={job.id}
        onClose={() => setShowNotificationHistory(false)}
      />

      {/* SOS disclaimer modal */}
      <SOSDisclaimerModal
        visible={sos.showDisclaimer}
        onAccept={() => void sos.dismissDisclaimer()}
      />

      {/* SOS countdown modal */}
      <SOSCountdownModal
        visible={sos.showCountdown}
        onCancel={sos.cancelCountdown}
        onComplete={() => void sos.handleCountdownComplete()}
      />
    </View>
  );
}
