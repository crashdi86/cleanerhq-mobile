import React from "react";
import { View, Text } from "@/tw";
import Svg, { Circle } from "react-native-svg";

interface StaffProgressRingProps {
  completed: number;
  total: number;
}

const SIZE = 56;
const STROKE_WIDTH = 5;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function StaffProgressRing({
  completed,
  total,
}: StaffProgressRingProps) {
  const progress = total > 0 ? completed / total : 0;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  return (
    <View className="items-center justify-center" style={{ width: SIZE, height: SIZE }}>
      <Svg width={SIZE} height={SIZE}>
        {/* Track */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="#E5E7EB"
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        {/* Progress */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="#B7F0AD"
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>
      {/* Center text */}
      <View className="absolute items-center justify-center">
        <Text className="text-sm font-semibold text-gray-900">
          {completed}
        </Text>
        <Text className="text-[10px] text-gray-500">of {total}</Text>
      </View>
    </View>
  );
}
