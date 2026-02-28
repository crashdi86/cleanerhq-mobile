import React, { useState, useMemo, useCallback } from "react";
import { ActivityIndicator } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faClipboardList,
  faCamera,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "expo-router";
import {
  useChecklist,
  useToggleChecklistItem,
} from "@/lib/api/hooks/useChecklist";
import { ApiError } from "@/lib/api/client";
import { showToast } from "@/store/toast-store";
import { ProgressBar } from "@/components/checklist/ProgressBar";
import { ChecklistSection } from "@/components/checklist/ChecklistSection";
import { PhotoRequiredPrompt } from "@/components/checklist/PhotoRequiredPrompt";
import type { JobStatus, ChecklistItem } from "@/lib/api/types";

interface ChecklistTabProps {
  jobId: string;
  jobStatus: JobStatus;
}

/** Gets the section/room name — API may use "room" or "category" */
function getSectionName(item: ChecklistItem): string {
  return item.room ?? item.category ?? "General";
}

/** Groups items by room/category, placing items without one under "General" */
function groupByRoom(
  items: ChecklistItem[]
): Array<{ room: string; items: ChecklistItem[] }> {
  const map = new Map<string, ChecklistItem[]>();

  for (const item of items) {
    const room = getSectionName(item);
    const existing = map.get(room);
    if (existing) {
      existing.push(item);
    } else {
      map.set(room, [item]);
    }
  }

  return Array.from(map.entries()).map(([room, roomItems]) => ({
    room,
    items: roomItems,
  }));
}

/** Safely compute percentage from checklist data — API may use "progress" or "percentage" */
function getPercentage(checklist: { percentage?: number; progress?: number; completed: number; total: number }): number {
  if (typeof checklist.percentage === "number") return checklist.percentage;
  if (typeof checklist.progress === "number") return checklist.progress;
  if (checklist.total === 0) return 0;
  return Math.round((checklist.completed / checklist.total) * 100);
}

export function ChecklistTab({ jobId, jobStatus }: ChecklistTabProps) {
  const router = useRouter();
  const { data: checklist, isLoading, isError } = useChecklist(jobId);
  const toggleMutation = useToggleChecklistItem();

  // Photo-required prompt state
  const [photoPromptItemId, setPhotoPromptItemId] = useState<string | null>(
    null
  );

  // Disable interactions when job is not in_progress
  const isDisabled = jobStatus !== "in_progress";

  // Group items by room
  const sections = useMemo(() => {
    if (!checklist) return [];
    return groupByRoom(checklist.items);
  }, [checklist]);

  // Compute required item stats
  const requiredStats = useMemo(() => {
    if (!checklist) return { total: 0, completed: 0, incompleteIds: new Set<string>() };

    const requiredItems = checklist.items.filter((i) => i.required);
    const completedRequired = requiredItems.filter((i) => i.completed);
    const incompleteRequired = requiredItems.filter((i) => !i.completed);

    return {
      total: requiredItems.length,
      completed: completedRequired.length,
      incompleteIds: new Set(incompleteRequired.map((i) => i.id)),
    };
  }, [checklist]);

  // Handle toggle
  const handleToggle = useCallback(
    (itemId: string, completed: boolean) => {
      // Check if this is a photo-required item being checked without photos
      if (completed && checklist) {
        const item = checklist.items.find((i) => i.id === itemId);
        if (item?.requires_photo && (!item.photos || item.photos.length === 0)) {
          setPhotoPromptItemId(itemId);
          return;
        }
      }

      toggleMutation.mutate(
        { jobId, itemId, completed },
        {
          onError: (err) => {
            if (
              err instanceof ApiError &&
              err.code === "PHOTO_REQUIRED_FOR_ITEM"
            ) {
              setPhotoPromptItemId(itemId);
            } else if (
              err instanceof ApiError &&
              err.code === "JOB_NOT_ASSIGNED"
            ) {
              showToast("error", "You are not assigned to this job");
            } else {
              showToast("error", "Failed to update checklist");
            }
          },
        }
      );
    },
    [jobId, checklist, toggleMutation]
  );

  // Handle camera press from item row
  const handleCameraPress = useCallback(
    (itemId: string) => {
      router.push({
        pathname: "/(app)/camera",
        params: { jobId, checklistItemId: itemId },
      });
    },
    [router, jobId]
  );

  // Handle photo thumbnail press
  const handlePhotoPress = useCallback(
    (_itemId: string) => {
      // Could open lightbox for this item's photos — for now navigate to Photos tab
      showToast("info", "View photo in Photos tab");
    },
    []
  );

  // Photo prompt handlers
  const handleTakePhotoFromPrompt = useCallback(() => {
    if (photoPromptItemId) {
      router.push({
        pathname: "/(app)/camera",
        params: { jobId, checklistItemId: photoPromptItemId },
      });
    }
    setPhotoPromptItemId(null);
  }, [photoPromptItemId, router, jobId]);

  const handleCancelPrompt = useCallback(() => {
    setPhotoPromptItemId(null);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <View className="mx-4 mt-4 bg-white rounded-2xl py-12 items-center justify-center">
        <ActivityIndicator size="large" color="#2A5B4F" />
        <Text className="text-sm text-gray-400 mt-3">
          Loading checklist...
        </Text>
      </View>
    );
  }

  // Error state
  if (isError || !checklist) {
    return (
      <View className="mx-4 mt-4 bg-white rounded-2xl py-12 items-center justify-center">
        <Text className="text-sm text-gray-400">
          Failed to load checklist
        </Text>
      </View>
    );
  }

  // Empty state
  if (checklist.items.length === 0) {
    return (
      <View className="mx-4 mt-4 bg-white rounded-2xl py-12 items-center justify-center">
        <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-3">
          <FontAwesomeIcon icon={faClipboardList} size={24} color="#9CA3AF" />
        </View>
        <Text className="text-sm text-gray-400">No checklist assigned</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Overall progress card */}
      <View className="mx-4 mt-4 bg-white rounded-2xl px-4 py-4">
        {/* Progress percentage */}
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-semibold text-gray-900">
            {getPercentage(checklist)}% Complete
          </Text>
          <Text className="text-sm text-gray-500">
            {checklist.completed}/{checklist.total}
          </Text>
        </View>

        {/* Overall progress bar */}
        <ProgressBar
          percentage={getPercentage(checklist)}
          height={6}
          fillColor={getPercentage(checklist) === 100 ? "#10B981" : "#B7F0AD"}
        />

        {/* Required items counter */}
        {requiredStats.total > 0 && (
          <Text className="text-xs text-gray-500 mt-2">
            {requiredStats.completed} of {requiredStats.total} required items
            completed
            {requiredStats.incompleteIds.size > 0 && (
              <Text className="text-xs text-amber-500">
                {" \u2022 "}
                {requiredStats.incompleteIds.size} remaining
              </Text>
            )}
          </Text>
        )}
      </View>

      {/* Room sections */}
      <View className="mx-4 mt-3">
        {sections.map((section) => (
          <ChecklistSection
            key={section.room}
            room={section.room}
            items={section.items}
            disabled={isDisabled}
            onToggle={handleToggle}
            onCameraPress={handleCameraPress}
            onPhotoPress={handlePhotoPress}
            highlightItemIds={requiredStats.incompleteIds}
          />
        ))}
      </View>

      {/* Disabled state message */}
      {isDisabled && (
        <View className="mx-4 mt-2 mb-2">
          <Text className="text-xs text-gray-400 text-center">
            {jobStatus === "scheduled"
              ? "Start the job to begin checking items"
              : "Checklist is read-only in this state"}
          </Text>
        </View>
      )}

      {/* Photo required prompt modal */}
      <PhotoRequiredPrompt
        visible={photoPromptItemId !== null}
        onTakePhoto={handleTakePhotoFromPrompt}
        onCancel={handleCancelPrompt}
      />
    </View>
  );
}
