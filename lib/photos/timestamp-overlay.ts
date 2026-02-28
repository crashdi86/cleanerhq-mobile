/**
 * Timestamp overlay utilities for photo metadata.
 *
 * For now, we store timestamp as metadata in StagedPhoto.timestamp
 * rather than burning it visually into the image. Visual burn-in can
 * be added later using react-native-view-shot if needed.
 */

/**
 * Returns a formatted timestamp string for the current moment.
 * Format: "YYYY-MM-DD HH:mm:ss"
 */
export function formatTimestamp(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * "Burns" a timestamp into a photo.
 *
 * Current implementation: returns the original URI unchanged.
 * The timestamp is stored as metadata in StagedPhoto.timestamp instead
 * of being visually overlaid onto the image.
 *
 * Future enhancement: use react-native-view-shot or expo-image-manipulator
 * to composite a text overlay onto the image.
 *
 * @param photoUri - The local URI of the captured/selected photo
 * @returns The photo URI (unchanged for now)
 */
export async function burnTimestamp(photoUri: string): Promise<string> {
  // For now, return the URI as-is. Timestamp metadata is stored
  // separately in StagedPhoto.timestamp.
  return photoUri;
}
