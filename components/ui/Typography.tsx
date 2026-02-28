import { Text, type TextProps } from "@/tw";
import { cn } from "@/lib/utils";

const variantClasses = {
  display: "text-[32px] font-bold",
  h1: "text-[28px] font-bold",
  h2: "text-[24px] font-semibold",
  h3: "text-[20px] font-semibold",
  body: "text-base font-normal",
  bodySm: "text-sm font-normal",
  caption: "text-xs font-normal",
  mono: "text-base font-medium font-mono",
} as const;

interface TypographyProps extends TextProps {
  variant?: keyof typeof variantClasses;
}

export function Typography({
  variant = "body",
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <Text
      className={cn("text-text-primary", variantClasses[variant], className)}
      {...props}
    >
      {children}
    </Text>
  );
}
