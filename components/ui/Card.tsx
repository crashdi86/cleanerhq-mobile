import { View, type ViewProps } from "@/tw";
import { cn } from "@/lib/utils";

interface CardProps extends ViewProps {
  variant?: "default" | "glass";
}

export function Card({ variant = "default", className, children, ...props }: CardProps) {
  return (
    <View
      className={cn(
        "rounded-[20px] p-md",
        variant === "default" && "bg-white shadow-card",
        variant === "glass" && "bg-glass-bg border border-glass-border",
        className
      )}
      style={variant === "default" ? { borderCurve: "continuous" } : undefined}
      {...props}
    >
      {children}
    </View>
  );
}
