import React, { useCallback } from "react";
import { Linking, StyleSheet } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faUser,
  faPhone,
  faEnvelope,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import type { AccountContact, ContactListItem } from "@/lib/api/types";

type ContactData = AccountContact | ContactListItem;

interface ContactCardProps {
  contact: ContactData;
  /** Navigate to account detail on press */
  onPress?: () => void;
  /** Show account name subtitle (contacts list) */
  showAccountName?: boolean;
}

/**
 * M-11 S2/S3: Reusable contact row with tap-to-call and tap-to-email actions.
 */
export function ContactCard({
  contact,
  onPress,
  showAccountName = false,
}: ContactCardProps) {
  const designation =
    "designation" in contact ? contact.designation : ("role" in contact ? contact.role : "");
  const accountName =
    "account_name" in contact ? contact.account_name : undefined;

  const handleCall = useCallback(() => {
    if (contact.phone) {
      void Linking.openURL(`tel:${contact.phone}`);
    }
  }, [contact.phone]);

  const handleEmail = useCallback(() => {
    if (contact.email) {
      void Linking.openURL(`mailto:${contact.email}`);
    }
  }, [contact.email]);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && onPress ? styles.cardPressed : undefined,
      ]}
    >
      {/* Avatar / icon */}
      <View style={styles.avatarContainer}>
        <FontAwesomeIcon icon={faUser} size={16} color="#6B7280" />
      </View>

      {/* Name + designation */}
      <View className="flex-1 ml-3">
        <Text
          className="text-[15px] font-semibold text-gray-900"
          numberOfLines={1}
        >
          {contact.name}
        </Text>
        {designation ? (
          <Text className="text-[13px] text-gray-500 mt-0.5" numberOfLines={1}>
            {designation}
          </Text>
        ) : null}
        {showAccountName && accountName ? (
          <Text className="text-[12px] text-gray-400 mt-0.5" numberOfLines={1}>
            {accountName}
          </Text>
        ) : null}
      </View>

      {/* Action buttons */}
      <View className="flex-row items-center gap-2">
        {contact.phone ? (
          <Pressable
            onPress={handleCall}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
            hitSlop={8}
          >
            <FontAwesomeIcon icon={faPhone} size={14} color="#2A5B4F" />
          </Pressable>
        ) : null}

        {contact.email ? (
          <Pressable
            onPress={handleEmail}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
            hitSlop={8}
          >
            <FontAwesomeIcon icon={faEnvelope} size={14} color="#2A5B4F" />
          </Pressable>
        ) : null}

        {onPress ? (
          <FontAwesomeIcon icon={faChevronRight} size={12} color="#D1D5DB" />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  cardPressed: {
    opacity: 0.7,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(42,91,79,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonPressed: {
    backgroundColor: "rgba(42,91,79,0.2)",
  },
});
