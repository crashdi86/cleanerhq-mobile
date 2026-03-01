import { View, Text } from "@/tw";
import { Image, StyleSheet } from "react-native";
import { cn } from "@/lib/utils";

interface AvatarCircleProps {
  /** Full name — first letters of first + last used for initials */
  name: string;
  /** Remote image URL (renders initials if null/undefined) */
  avatarUrl?: string | null;
  /** Diameter in pixels (default 40) */
  size?: number;
  className?: string;
}

/** Circular avatar — image if URL provided, initials otherwise */
export function AvatarCircle({
  name,
  avatarUrl,
  size = 40,
  className,
}: AvatarCircleProps) {
  const initials = getInitials(name);

  return (
    <View
      className={cn("items-center justify-center overflow-hidden", className)}
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          resizeMode="cover"
        />
      ) : (
        <Text
          className="font-semibold text-white"
          style={{ fontSize: size * 0.36 }}
        >
          {initials}
        </Text>
      )}
    </View>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#2A5B4F",
  },
});
