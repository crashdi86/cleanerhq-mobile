import { View, Text, TextInput } from "@/tw";
import { cn } from "@/lib/utils";
import { type TextInputProps as RNTextInputProps } from "react-native";
import React from "react";

interface InputProps extends Omit<RNTextInputProps, "className"> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  variant?: "default" | "glass";
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  className,
  variant = "default",
  ...props
}: InputProps) {
  const isGlass = variant === "glass";

  return (
    <View className={cn("gap-1", className)}>
      {label && (
        <Text
          className={cn(
            "text-sm font-medium mb-1",
            isGlass ? "text-white/70" : "text-text-primary"
          )}
        >
          {label}
        </Text>
      )}
      <View
        className={cn(
          "flex-row items-center rounded-[16px] border px-4",
          isGlass
            ? "bg-white/[0.08] border-white/[0.15]"
            : "bg-white border-border",
          error && !isGlass && "border-error"
        )}
        style={{ height: isGlass ? 60 : undefined, paddingVertical: isGlass ? 0 : 12 }}
      >
        {leftIcon && <View className="mr-3">{leftIcon}</View>}
        <TextInput
          className={cn(
            "flex-1 text-base",
            isGlass ? "text-white" : "text-text-primary"
          )}
          placeholderTextColor={isGlass ? "rgba(255,255,255,0.5)" : "#6B7280"}
          {...props}
        />
        {rightIcon && <View className="ml-2">{rightIcon}</View>}
      </View>
      {error && (
        <Text className={cn("text-xs mt-1", isGlass ? "text-red-400" : "text-error")}>
          {error}
        </Text>
      )}
    </View>
  );
}
