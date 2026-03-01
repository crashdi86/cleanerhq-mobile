/**
 * Maps API `link_url` values from push notification payloads
 * to Expo Router paths for navigation.
 */

interface RouteMapping {
  pattern: RegExp;
  toRoute: (match: RegExpMatchArray) => string;
}

const ROUTE_MAPPINGS: RouteMapping[] = [
  {
    pattern: /^\/jobs\/([a-f0-9-]+)$/,
    toRoute: (m) => `/(app)/jobs/${m[1]}`,
  },
  {
    pattern: /^\/chat\/([a-f0-9-]+)$/,
    toRoute: () => `/(app)/(tabs)/messages`,
  },
  {
    pattern: /^\/sos\/alerts\/([a-f0-9-]+)$/,
    toRoute: (m) => `/(app)/sos-detail?id=${m[1]}`,
  },
  {
    pattern: /^\/schedule$/,
    toRoute: () => `/(app)/(tabs)/schedule`,
  },
  {
    pattern: /^\/notifications$/,
    toRoute: () => `/(app)/notifications`,
  },
  {
    pattern: /^\/time\/entries$/,
    toRoute: () => `/(app)/time-history`,
  },
  {
    pattern: /^\/invoices\/([a-f0-9-]+)$/,
    toRoute: (m) => `/(app)/invoices/${m[1]}`,
  },
];

/**
 * Convert an API link_url to an Expo Router path.
 * Returns null for unknown/malformed URLs (caller should fall back to home).
 */
export function linkUrlToRoute(linkUrl: string | undefined): string | null {
  if (!linkUrl) return null;

  for (const mapping of ROUTE_MAPPINGS) {
    const match = linkUrl.match(mapping.pattern);
    if (match) return mapping.toRoute(match);
  }

  return null;
}
