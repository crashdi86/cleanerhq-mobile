import React, { useCallback } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faUser, faCheck } from "@fortawesome/free-solid-svg-icons";
import { View, Text, Pressable } from "@/tw";
import { useTeamMembers } from "@/lib/api/hooks/useJobCreation";
import { colors } from "@/constants/tokens";
import type { TeamMember } from "@/lib/api/types";

interface TeamAssignmentProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  error?: string;
}

/**
 * Get initials from a full name. E.g. "John Doe" -> "JD"
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0];
  const last = parts[parts.length - 1];
  if (!first) return "";
  if (parts.length === 1 || !last) return first.charAt(0).toUpperCase();
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}

export function TeamAssignment({
  selectedIds,
  onChange,
  error,
}: TeamAssignmentProps) {
  const { data: members, isLoading, isError } = useTeamMembers();

  const toggleMember = useCallback(
    (memberId: string) => {
      if (selectedIds.includes(memberId)) {
        onChange(selectedIds.filter((id) => id !== memberId));
      } else {
        onChange([...selectedIds, memberId]);
      }
    },
    [selectedIds, onChange]
  );

  return (
    <View className="gap-1">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-sm font-medium text-text-primary">
          Team Assignment
        </Text>
        {selectedIds.length > 0 && (
          <Text className="text-xs font-medium text-primary">
            {selectedIds.length} selected
          </Text>
        )}
      </View>

      <View className="bg-white border border-border rounded-2xl overflow-hidden" style={styles.container}>
        {isLoading && (
          <View className="py-6 items-center">
            <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
            <Text className="text-xs text-text-secondary mt-2">
              Loading team...
            </Text>
          </View>
        )}

        {isError && (
          <View className="py-4 items-center">
            <Text className="text-sm text-error">Failed to load team</Text>
          </View>
        )}

        {!isLoading && !isError && members && members.length === 0 && (
          <View className="py-4 items-center">
            <Text className="text-sm text-text-secondary">
              No team members found
            </Text>
          </View>
        )}

        {members?.map((member, index) => (
          <MemberRow
            key={member.id}
            member={member}
            isSelected={selectedIds.includes(member.id)}
            onToggle={toggleMember}
            isLast={index === members.length - 1}
          />
        ))}
      </View>

      {error && (
        <Text className="text-xs text-error mt-1">{error}</Text>
      )}
    </View>
  );
}

// ── Member Row ──

interface MemberRowProps {
  member: TeamMember;
  isSelected: boolean;
  onToggle: (id: string) => void;
  isLast: boolean;
}

function MemberRow({ member, isSelected, onToggle, isLast }: MemberRowProps) {
  return (
    <Pressable
      onPress={() => onToggle(member.id)}
      className={`flex-row items-center px-4 py-3 ${!isLast ? "border-b border-border/50" : ""} active:bg-gray-50`}
    >
      {/* Checkbox */}
      <View
        className={`w-9 h-9 rounded-full items-center justify-center mr-3 ${
          isSelected ? "bg-primary" : "border-2 border-gray-300"
        }`}
      >
        {isSelected && (
          <FontAwesomeIcon icon={faCheck} size={14} color="#FFFFFF" />
        )}
      </View>

      {/* Avatar */}
      <View className="w-9 h-9 rounded-full bg-primary/10 items-center justify-center mr-3">
        {member.avatar_url ? (
          <Text className="text-sm font-semibold text-primary">
            {getInitials(member.full_name)}
          </Text>
        ) : (
          <FontAwesomeIcon
            icon={faUser}
            size={14}
            color={colors.primary.DEFAULT}
          />
        )}
      </View>

      {/* Info */}
      <View className="flex-1">
        <Text className="text-sm font-medium text-text-primary">
          {member.full_name}
        </Text>
        {member.role_title ? (
          <Text className="text-xs text-text-secondary">
            {member.role_title}
          </Text>
        ) : (
          <Text className="text-xs text-text-secondary">
            {member.role === "OWNER" ? "Owner" : "Staff"}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 0.06,
    shadowColor: "#000",
    elevation: 2,
  },
});
