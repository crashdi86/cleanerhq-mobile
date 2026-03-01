import React, { useCallback } from "react";
import { Platform, StyleSheet } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faKey,
  faTriangleExclamation,
  faUsers,
  faCopy,
  faLock,
  faPaw,
  faParking,
} from "@fortawesome/free-solid-svg-icons";
import * as Clipboard from "expo-clipboard";
import { showToast } from "@/store/toast-store";
import { useAuthStore } from "@/store/auth-store";
import type { JobDetail } from "@/lib/api/types";

interface SpecialInstructionsCardProps {
  job: JobDetail;
}

/**
 * M-03 + M-06 S3: Special Instructions & Property Access Card.
 *
 * Visibility gate: only when job is in_progress AND current user is assigned.
 * When NOT in_progress, shows locked placeholder if access info exists.
 * Sections: gate code, lockbox code, alarm code (tap-to-copy),
 *           parking instructions, pet warning, special instructions, internal notes.
 */
export function SpecialInstructionsCard({ job }: SpecialInstructionsCardProps) {
  const userId = useAuthStore((s) => s.user?.id);

  const hasGateCode = Boolean(job.gate_code);
  const hasLockboxCode = Boolean(job.lockbox_code);
  const hasAlarmCode = Boolean(job.alarm_code);
  const hasParkingInstructions = Boolean(job.parking_instructions);
  const hasPetWarning = Boolean(job.pet_warning);
  const hasSpecialInstructions = Boolean(job.special_instructions);
  const hasPropertyAccess = Boolean(job.property_access_notes);
  const hasInternalNotes = Boolean(job.internal_notes);

  const hasAnyAccessInfo =
    hasGateCode ||
    hasLockboxCode ||
    hasAlarmCode ||
    hasParkingInstructions ||
    hasPetWarning ||
    hasPropertyAccess;

  const hasAnything =
    hasAnyAccessInfo || hasSpecialInstructions || hasInternalNotes;

  // If nothing to show at all, render nothing
  if (!hasAnything) {
    return null;
  }

  // Locked state: job NOT in_progress but access info exists
  if (job.status !== "in_progress") {
    if (hasAnyAccessInfo) {
      return <LockedAccessPlaceholder />;
    }
    // Only special instructions / internal notes without access info
    // Still gate behind in_progress
    return null;
  }

  // Fully gated: must be assigned
  if (!userId || !job.assigned_to.includes(userId)) return null;

  return (
    <View className="mx-4 mt-4 gap-3">
      {/* Property Access / Gate Code / Lockbox / Alarm */}
      {hasAnyAccessInfo && (
        <PropertyAccessSection
          gateCode={job.gate_code}
          lockboxCode={job.lockbox_code}
          alarmCode={job.alarm_code}
          parkingInstructions={job.parking_instructions}
          propertyAccessNotes={job.property_access_notes}
        />
      )}

      {/* Pet Warning */}
      {hasPetWarning && <PetWarningBanner warning={job.pet_warning!} />}

      {/* Special Instructions */}
      {hasSpecialInstructions && (
        <SpecialInstructionsSection text={job.special_instructions!} />
      )}

      {/* Internal Notes (Team Only) */}
      {hasInternalNotes && <InternalNotesSection text={job.internal_notes!} />}
    </View>
  );
}

// ── Locked Placeholder ──

function LockedAccessPlaceholder() {
  return (
    <View className="mx-4 mt-4">
      <View className="bg-gray-50 rounded-2xl p-4 items-center">
        <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center mb-2">
          <FontAwesomeIcon icon={faLock} size={16} color="#9CA3AF" />
        </View>
        <Text className="text-sm text-gray-500 font-medium">
          Start the job to view access info
        </Text>
      </View>
    </View>
  );
}

// ── Property Access Section ──

function PropertyAccessSection({
  gateCode,
  lockboxCode,
  alarmCode,
  parkingInstructions,
  propertyAccessNotes,
}: {
  gateCode: string | null;
  lockboxCode: string | null;
  alarmCode: string | null;
  parkingInstructions: string | null;
  propertyAccessNotes: string | null;
}) {
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
        <CodeRow label="Gate Code" value={gateCode} />
      ) : null}

      {lockboxCode ? (
        <CodeRow label="Lockbox Code" value={lockboxCode} />
      ) : null}

      {alarmCode ? (
        <CodeRow label="Alarm Code" value={alarmCode} />
      ) : null}

      {parkingInstructions ? (
        <View className="mt-2">
          <View className="flex-row items-center mb-1">
            <FontAwesomeIcon icon={faParking} size={12} color="#6B7280" />
            <Text className="text-xs text-gray-500 ml-1.5">Parking</Text>
          </View>
          <Text className="text-sm text-gray-700 leading-5">
            {parkingInstructions}
          </Text>
        </View>
      ) : null}

      {propertyAccessNotes ? (
        <Text className="text-sm text-gray-700 leading-5 mt-2">
          {propertyAccessNotes}
        </Text>
      ) : null}
    </View>
  );
}

// ── Code Row (tap-to-copy, monospace) ──

function CodeRow({ label, value }: { label: string; value: string }) {
  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(value);
    showToast("success", `${label} copied`);
  }, [value, label]);

  return (
    <Pressable
      onPress={() => void handleCopy()}
      className="flex-row items-center justify-between bg-gray-50 rounded-xl px-4 py-3 mb-2"
    >
      <View>
        <Text className="text-xs text-gray-500 mb-1">{label}</Text>
        <Text
          className="text-xl font-bold text-gray-900"
          style={codeStyles.codeText}
        >
          {value}
        </Text>
      </View>
      <View className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center">
        <FontAwesomeIcon icon={faCopy} size={14} color="#6B7280" />
      </View>
    </Pressable>
  );
}

// ── Pet Warning Banner ──

function PetWarningBanner({ warning }: { warning: string }) {
  return (
    <View style={componentStyles.petWarning} className="rounded-2xl p-4">
      <View className="flex-row items-center mb-1">
        <FontAwesomeIcon icon={faPaw} size={14} color="#F59E0B" />
        <Text className="text-sm font-bold text-amber-800 ml-2">
          Pet Warning
        </Text>
      </View>
      <Text className="text-sm text-amber-900 leading-5">{warning}</Text>
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

const codeStyles = StyleSheet.create({
  codeText: {
    fontFamily: Platform.select({
      ios: "JetBrainsMono-Bold",
      android: "JetBrainsMono-Bold",
      default: "monospace",
    }),
    letterSpacing: 2,
  },
});

const componentStyles = StyleSheet.create({
  petWarning: {
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
  },
});
