import React from "react";
import { Linking } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { formatPhoneDisplay } from "@/lib/job-actions";

interface ContactActionsProps {
  phone: string | null;
  email: string | null;
}

function handleCall(phone: string): void {
  const digits = phone.replace(/\D/g, "");
  void Linking.openURL(`tel:${digits}`);
}

function handleEmail(email: string): void {
  void Linking.openURL(`mailto:${email}`);
}

export function ContactActions({ phone, email }: ContactActionsProps) {
  if (!phone && !email) {
    return null;
  }

  return (
    <View className="flex-row items-center gap-3">
      {phone ? (
        <>
          <Text className="text-sm text-gray-700 flex-1">
            {formatPhoneDisplay(phone)}
          </Text>
          <Pressable
            onPress={() => handleCall(phone)}
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <FontAwesomeIcon icon={faPhone} size={16} color="#2A5B4F" />
          </Pressable>
        </>
      ) : null}

      {email ? (
        <Pressable
          onPress={() => handleEmail(email)}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <FontAwesomeIcon icon={faEnvelope} size={16} color="#2A5B4F" />
        </Pressable>
      ) : null}
    </View>
  );
}
