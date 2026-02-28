import React, { useCallback } from "react";
import { Platform } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faKey,
  faTriangleExclamation,
  faUsers,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";
import * as Clipboard from "expo-clipboard";
import { showToast } from "@/store/toast-store";
import { useAuthStore } from "@/store/auth-store";
import type { JobDetail } from "@/lib/api/types";

interface SpecialInstructionsCardProps {
  job: JobDetail;
}

/**
 * Phase 5: Special Instructions Card
 *
 * Visibility gate: only when job is in_progress AND current user is assigned.
 * Sections: gate code (tap-to-copy), special instructions, internal notes.
 * Empty sections return null.
 */
export function SpecialInstructionsCard({ job }: SpecialInstructionsCardProps) {
  const userId = useAuthStore((s) => s.user?.id);

  // Visibility gate: only show when in_progress and user is assigned
  if (job.status !== "in_progress") return null;
  if (!userId || !job.assigned_to.includes(userId)) return null;

  const hasGateCode = Boolean(job.gate_code);
  const hasSpecialInstructions = Boolean(job.special_instructions);
  const hasPropertyAccess = Boolean(job.property_access_notes);
  const hasInternalNotes = Boolean(job.internal_notes);

  // If nothing to show, render nothing
  if (
    !hasGateCode &&
    !hasSpecialInstructions &&
    !hasPropertyAccess &&
    !hasInternalNotes
  ) {
    return null;
  }

  return (
    <View className="mx-4 mt-4 gap-3">
      {/* Property Access / Gate Code */}
      {(hasGateCode || hasPropertyAccess) && (
        <PropertyAccessSection
          gateCode={job.gate_code}
          propertyAccessNotes={job.property_access_notes}
        />
      )}

      {/* Special Instructions */}
      {hasSpecialInstructions && (
        <SpecialInstructionsSection text={job.special_instructions!} />
      )}

      {/* Internal Notes (Team Only) */}
      {hasInternalNotes && <InternalNotesSection text={job.internal_notes!} />}
    </View>
  );
}

// ── Property Access Section ──

function PropertyAccessSection({
  gateCode,
  propertyAccessNotes,
}: {
  gateCode: string | null;
  propertyAccessNotes: string | null;
}) {
  const handleCopyGateCode = useCallback(async () => {
    if (!gateCode) return;
    await Clipboard.setStringAsync(gateCode);
    showToast("success", "Gate code copied");
  }, [gateCode]);

  return (
    <View className="bg-white rounded-2xl p-4">
      <View className="flex-row items-center mb-3">
        <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-2">
          <FontAwesomeIcon icon={faKey} size={14} color="#3B82F6" />
        </View>
        <Text className="text-sm font-bold text-gray-900">
          Property Access
        </Text>
      </View>

      {gateCode ? (
        <Pressable
          onPress={handleCopyGateCode}
          className="flex-row items-center justify-between bg-gray-50 rounded-xl px-4 py-3 mb-2"
        >
          <View>
            <Text className="text-xs text-gray-500 mb-1">Gate Code</Text>
            <Text
              className="text-xl font-bold text-gray-900"
              style={{
                fontFamily: Platform.select({
                  ios: "JetBrainsMono-Bold",
                  android: "JetBrainsMono-Bold",
                  default: "monospace",
                }),
                letterSpacing: 2,
              }}
            >
              {gateCode}
            </Text>
          </View>
          <View className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center">
            <FontAwesomeIcon icon={faCopy} size={14} color="#6B7280" />
          </View>
        </Pressable>
      ) : null}

      {propertyAccessNotes ? (
        <Text className="text-sm text-gray-700 leading-5">
          {propertyAccessNotes}
        </Text>
      ) : null}
    </View>
  );
}

// ── Special Instructions Section ──

function SpecialInstructionsSection({ text }: { text: string }) {
  return (
    <View className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
      <View className="flex-row items-center mb-2">
        <FontAwesomeIcon
          icon={faTriangleExclamation}
          size={14}
          color="#F59E0B"
        />
        <Text className="text-sm font-bold text-amber-800 ml-2">
          Special Instructions
        </Text>
      </View>
      <Text className="text-sm text-amber-900 leading-5">{text}</Text>
    </View>
  );
}

// ── Internal Notes Section ──

function InternalNotesSection({ text }: { text: string }) {
  return (
    <View className="bg-gray-50 rounded-2xl p-4">
      <View className="flex-row items-center mb-2">
        <FontAwesomeIcon icon={faUsers} size={14} color="#6B7280" />
        <Text className="text-sm font-bold text-gray-700 ml-2">
          Internal Notes
        </Text>
        <View className="bg-gray-200 rounded-full px-2 py-0.5 ml-2">
          <Text className="text-xs font-medium text-gray-600">Team Only</Text>
        </View>
      </View>
      <Text className="text-sm text-gray-600 leading-5">{text}</Text>
    </View>
  );
}
