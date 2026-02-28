import React from "react";
import { StyleSheet } from "react-native";
import { View, Text } from "@/tw";
import { JOB_STATUS_CONFIG } from "@/lib/job-actions";
import type { JobStatus } from "@/lib/api/types";

interface StatusBadgeProps {
  status: JobStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = JOB_STATUS_CONFIG[status];

  return (
    <View
      className={`self-start rounded-full px-3 py-1 ${className ?? ""}`}
      style={{ backgroundColor: config.bgColor }}
    >
      <Text
        className="text-xs font-bold"
        style={{ color: config.textColor }}
      >
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({});
