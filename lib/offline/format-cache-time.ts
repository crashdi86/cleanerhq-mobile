/**
 * M-07 S4: Cache time formatting utility.
 *
 * Formats a timestamp relative to now for staleness display.
 * Examples: "Just now", "3 min ago", "2 hours ago", "Yesterday", "3 days ago"
 */

export function formatCacheTime(cachedAt: number): string {
  const now = Date.now();
  const diffMs = now - cachedAt;

  if (diffMs < 0) return "Just now";

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes === 1) return "1 min ago";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  // Beyond 7 days — show date
  const date = new Date(cachedAt);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/**
 * Returns true if the cached data is stale (older than threshold).
 * Default threshold: 24 hours.
 */
export function isCacheStale(
  cachedAt: number,
  thresholdMs = 24 * 60 * 60 * 1000
): boolean {
  return Date.now() - cachedAt > thresholdMs;
}
