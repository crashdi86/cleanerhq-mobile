import { ActivityIndicator } from "react-native";
import { Pressable, Text } from "@/tw";
import { cn } from "@/lib/utils";

const variantClasses = {
  primary: "bg-primary",
  secondary: "bg-mint",
  outline: "border-2 border-primary bg-transparent",
  ghost: "bg-transparent",
  destructive: "bg-error",
} as const;

const textClasses = {
  primary: "text-text-inverse font-semibold",
  secondary: "text-primary font-semibold",
  outline: "text-primary font-semibold",
  ghost: "text-primary font-semibold",
  destructive: "text-text-inverse font-semibold",
} as const;

const sizeClasses = {
  sm: "px-4 py-2",
  md: "px-6 py-3",
  lg: "px-8 py-4",
} as const;

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled,
  loading,
  className,
}: ButtonProps) {
  const spinnerColor =
    variant === "primary" || variant === "destructive" ? "#fff" : "#2A5B4F";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={cn(
        "flex-row items-center justify-center rounded-[16px]",
        variantClasses[variant],
        sizeClasses[size],
        (disabled || loading) && "opacity-50",
        className
      )}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <Text className={cn("text-base", textClasses[variant])}>{title}</Text>
      )}
    </Pressable>
  );
}
