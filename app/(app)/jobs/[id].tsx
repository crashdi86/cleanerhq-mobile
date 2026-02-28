import React, { useState, useCallback, useMemo } from "react";
import { RefreshControl } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, ScrollView } from "@/tw";
import { useJobDetail } from "@/lib/api/hooks/useJobDetail";
import { useChecklist } from "@/lib/api/hooks/useChecklist";
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

  // Fetch checklist for gating sheet
  const { data: checklistData } = useChecklist(id ?? "");

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
        return (
          <NotesTab
            internalNotes={job.internal_notes}
            description={job.description}
          />
        );
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

      {/* Fixed bottom action bar */}
      <BottomActionBar
        job={job}
        onChecklistGatePress={handleChecklistGatePress}
      />

      {/* Incomplete items sheet (completion gating) */}
      <IncompleteItemsSheet
        visible={showIncompleteSheet}
        items={incompleteRequiredItems}
        onClose={() => setShowIncompleteSheet(false)}
        onItemPress={handleIncompleteItemPress}
        onGoToChecklist={handleGoToChecklist}
      />
    </View>
  );
}
