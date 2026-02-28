import React from "react";
import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/Button";

interface JobDetailErrorProps {
  message: string;
  onRetry: () => void;
}

export function JobDetailError({ message, onRetry }: JobDetailErrorProps) {
  return (
    <View className="flex-1 bg-[#F8FAF9] items-center justify-center px-6">
      <FontAwesomeIcon
        icon={faCircleExclamation}
        size={48}
        color="#EF4444"
      />
      <Text className="text-base text-gray-700 text-center mt-4 mb-6">
        {message}
      </Text>
      <Button title="Retry" onPress={onRetry} variant="primary" />
    </View>
  );
}
