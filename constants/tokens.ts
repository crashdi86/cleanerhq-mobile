export const colors = {
  primary: {
    DEFAULT: "#2A5B4F",
    dark: "#234E43",
    light: "#3A6B5F",
  },
  mint: "#B7F0AD",
  accent: "#F59E0B",
  accentBg: "#E8F5E9",
  error: "#EF4444",
  warning: "#F59E0B",
  success: "#10B981",
  info: "#3B82F6",
  surface: {
    light: "#F8FAF9",
    dark: "#1A1A2E",
  },
  text: {
    primary: "#1F2937",
    secondary: "#6B7280",
    inverse: "#FFFFFF",
  },
  border: "#E5E7EB",
  glass: {
    bg: "rgba(42,91,79,0.95)",
    overlay: "rgba(255,255,255,0.08)",
    border: "rgba(255,255,255,0.15)",
  },
  tab: {
    active: "#B7F0AD",
    inactive: "rgba(255,255,255,0.5)",
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
} as const;

export const borderRadius = {
  card: 20,
  cardLg: 24,
  button: 16,
  input: 16,
  avatar: 9999,
  badge: 12,
} as const;

export const shadows = {
  soft: {
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 0.06,
    shadowColor: "#000",
    elevation: 2,
  },
  card: {
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    shadowOpacity: 0.08,
    shadowColor: "#000",
    elevation: 4,
  },
  glass: {
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 32,
    shadowOpacity: 0.15,
    shadowColor: "#2A5B4F",
    elevation: 8,
  },
  floating: {
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 40,
    shadowOpacity: 0.12,
    shadowColor: "#000",
    elevation: 12,
  },
  glow: {
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    shadowOpacity: 0.4,
    shadowColor: "#B7F0AD",
    elevation: 6,
  },
} as const;

export const typography = {
  display: { fontSize: 32, fontWeight: "700" as const, fontFamily: "PlusJakartaSans" },
  h1: { fontSize: 28, fontWeight: "700" as const, fontFamily: "PlusJakartaSans" },
  h2: { fontSize: 24, fontWeight: "600" as const, fontFamily: "PlusJakartaSans" },
  h3: { fontSize: 20, fontWeight: "600" as const, fontFamily: "PlusJakartaSans" },
  body: { fontSize: 16, fontWeight: "400" as const, fontFamily: "PlusJakartaSans" },
  bodySm: { fontSize: 14, fontWeight: "400" as const, fontFamily: "PlusJakartaSans" },
  caption: { fontSize: 12, fontWeight: "400" as const, fontFamily: "PlusJakartaSans" },
  mono: { fontSize: 16, fontWeight: "500" as const, fontFamily: "JetBrainsMono" },
} as const;
