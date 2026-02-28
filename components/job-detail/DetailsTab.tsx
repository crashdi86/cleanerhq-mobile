import React from "react";
import { Linking, Platform } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { useRouter } from "expo-router";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faDiamondTurnRight,
  faPhone,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { formatDuration, formatPhoneDisplay, formatFullAddress } from "@/lib/job-actions";
import { TeamMemberList } from "@/components/job-detail/TeamMemberList";
import type { JobDetail } from "@/lib/api/types";

interface DetailsTabProps {
  job: JobDetail;
}

function formatScheduledTime(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const dateStr = startDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const startTime = startDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const endTime = endDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${dateStr}, ${startTime} - ${endTime}`;
}

function openNavigation(lat: number, lng: number): void {
  const action = Platform.select({
    ios: () => Linking.openURL(`maps://app?daddr=${lat},${lng}`),
    android: () => Linking.openURL(`google.navigation:q=${lat},${lng}`),
    default: () =>
      Linking.openURL(
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
      ),
  });
  void action();
}

function handleCall(phone: string): void {
  const digits = phone.replace(/\D/g, "");
  void Linking.openURL(`tel:${digits}`);
}

interface DetailRowProps {
  label: string;
  value: string | null;
  icon?: typeof faDiamondTurnRight;
  onIconPress?: () => void;
  isLast?: boolean;
}

function DetailRow({ label, value, icon, onIconPress, isLast }: DetailRowProps) {
  if (!value) {
    return null;
  }

  return (
    <View className={`py-3 ${isLast ? "" : "border-b border-gray-100"}`}>
      <Text className="text-xs font-medium text-gray-500 mb-1">{label}</Text>
      <View className="flex-row items-center justify-between">
        <Text className="text-sm text-gray-900 flex-1">{value}</Text>
        {icon && onIconPress ? (
          <Pressable
            onPress={onIconPress}
            className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center ml-2"
          >
            <FontAwesomeIcon icon={icon} size={14} color="#2A5B4F" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function DetailsTab({ job }: DetailsTabProps) {
  const router = useRouter();
  const scheduledTime = formatScheduledTime(
    job.scheduled_start,
    job.scheduled_end
  );

  const estimatedDuration = job.estimated_hours
    ? formatDuration(job.estimated_hours)
    : null;

  const fullAddress = formatFullAddress(job.service_address);
  const contactPhone = job.client_contact?.phone ?? null;

  return (
    <View className="mx-4 mt-4 bg-white rounded-2xl px-4 overflow-hidden">
      <DetailRow label="Service Type" value={job.job_type} />
      <DetailRow label="Scheduled Time" value={scheduledTime} />
      <DetailRow label="Estimated Duration" value={estimatedDuration} />

      {/* Client row — tappable, navigates to account detail */}
      <DetailRow
        label="Client"
        value={job.account_name}
        icon={faChevronRight}
        onIconPress={() =>
          router.push({
            pathname: "/(app)/accounts/[id]" as const,
            params: { id: job.account.id },
          } as never)
        }
      />

      {/* Address row with navigation icon */}
      <DetailRow
        label="Address"
        value={fullAddress}
        icon={faDiamondTurnRight}
        onIconPress={() =>
          openNavigation(job.service_address.lat, job.service_address.lng)
        }
      />

      {/* Phone row with call icon */}
      {contactPhone ? (
        <DetailRow
          label="Phone"
          value={formatPhoneDisplay(contactPhone)}
          icon={faPhone}
          onIconPress={() => handleCall(contactPhone)}
        />
      ) : null}

      <DetailRow label="Description" value={job.description} isLast={!job.assigned_to.length} />

      {/* Team members section */}
      {job.assigned_to.length > 0 ? (
        <View className="py-3">
          <Text className="text-xs font-medium text-gray-500 mb-2">
            Team Members
          </Text>
          <TeamMemberList assignedIds={job.assigned_to} />
        </View>
      ) : null}
    </View>
  );
}
