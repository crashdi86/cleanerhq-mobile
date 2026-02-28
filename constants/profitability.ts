export const MARGIN_THRESHOLDS = {
  HEALTHY: 30,
  WATCH: 15,
} as const;

export type MarginLevel = "HEALTHY" | "WATCH" | "LOW";

export const MARGIN_COLORS: Record<MarginLevel, string> = {
  HEALTHY: "#22C55E",
  WATCH: "#F59E0B",
  LOW: "#EF4444",
};

export const MARGIN_BG_COLORS: Record<MarginLevel, string> = {
  HEALTHY: "#F0FDF4",
  WATCH: "#FFFBEB",
  LOW: "#FEF2F2",
};

export const MARGIN_LABELS: Record<MarginLevel, string> = {
  HEALTHY: "HEALTHY",
  WATCH: "WATCH",
  LOW: "LOW",
};

export function getMarginLevel(marginPercent: number): MarginLevel {
  if (marginPercent >= MARGIN_THRESHOLDS.HEALTHY) return "HEALTHY";
  if (marginPercent >= MARGIN_THRESHOLDS.WATCH) return "WATCH";
  return "LOW";
}
