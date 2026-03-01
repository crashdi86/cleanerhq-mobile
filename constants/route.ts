/**
 * Route view constants (M-10).
 */

/** Team color palette for multi-crew marker differentiation. */
export const TEAM_COLORS = [
  "#2A5B4F",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#F59E0B",
] as const;

/** Default team color when single-crew (primary). */
export const DEFAULT_TEAM_COLOR = TEAM_COLORS[0];

/** Status → border color mapping for stop cards. */
export const STOP_STATUS_COLORS: Record<string, string> = {
  scheduled: "#2A5B4F",
  in_progress: "#F59E0B",
  completed: "#10B981",
  cancelled: "#EF4444",
};

/** Grayscale map style for subtle map backgrounds. */
export const GRAYSCALE_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ saturation: -100 }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6B7280" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#F3F4F6" }] },
];
