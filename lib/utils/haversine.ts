/**
 * Haversine formula — calculate the great-circle distance
 * between two points on the Earth's surface.
 *
 * @returns Distance in kilometers
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Estimate drive time from Haversine distance using average urban speed.
 *
 * @param distanceKm - Distance in kilometers
 * @param avgSpeedKmh - Average driving speed (default: 40 km/h for urban)
 * @returns Estimated minutes
 */
export function estimateDriveMinutes(
  distanceKm: number,
  avgSpeedKmh = 40
): number {
  if (avgSpeedKmh <= 0) return 0;
  return Math.round((distanceKm / avgSpeedKmh) * 60);
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
