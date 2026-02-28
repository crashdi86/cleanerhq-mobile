import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";

const MAX_DIMENSION = 1920;
const COMPRESS_QUALITY = 0.8;
const SIZE_THRESHOLD_BYTES = 2 * 1024 * 1024; // 2 MB
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Compress a photo if it exceeds 2 MB.
 * Resizes to 1920px max width at 0.8 JPEG quality.
 * Returns the original URI if already under threshold.
 * Throws if the result still exceeds 10 MB.
 */
export async function compressPhoto(uri: string): Promise<string> {
  const info = await FileSystem.getInfoAsync(uri);

  if (!info.exists) {
    throw new Error("File not found");
  }

  const fileSize = info.size ?? 0;

  // Already small enough — skip compression
  if (fileSize <= SIZE_THRESHOLD_BYTES) {
    return uri;
  }

  // Compress: resize to max dimension and reduce quality
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_DIMENSION } }],
    { compress: COMPRESS_QUALITY, format: ImageManipulator.SaveFormat.JPEG }
  );

  // Verify result is under 10 MB
  const compressedInfo = await FileSystem.getInfoAsync(result.uri);
  const compressedSize = compressedInfo.exists ? (compressedInfo.size ?? 0) : 0;

  if (compressedSize > MAX_SIZE_BYTES) {
    throw new Error("Photo exceeds 10MB even after compression");
  }

  return result.uri;
}
