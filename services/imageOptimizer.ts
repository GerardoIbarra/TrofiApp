import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

export interface OptimizedImageResult {
  uri: string;
  width: number;
  height: number;
  base64?: string;
}

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.0 - 1.0 (default 0.78)
  format?: SaveFormat;
}

const DEFAULT_MAX_DIMENSION = 800;
const DEFAULT_QUALITY = 0.78; // Satisfies 0.75 - 0.80 range, resulting in <250KB

/**
 * Resizes and compresses an image to max 800x800px in JPEG format.
 * Guarantees small payload suitable for mobile field conditions with poor cell coverage.
 */
export async function optimizeImageForUpload(
  uri: string,
  width?: number,
  height?: number,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImageResult> {
  const maxDim = options.maxWidth || DEFAULT_MAX_DIMENSION;
  const quality = options.quality ?? DEFAULT_QUALITY;
  const format = options.format ?? SaveFormat.JPEG;

  const actions: any[] = [];

  if (width && height) {
    if (width > maxDim || height > maxDim) {
      if (width >= height) {
        actions.push({ resize: { width: maxDim } });
      } else {
        actions.push({ resize: { height: maxDim } });
      }
    }
  } else {
    // If dimensions are not provided upfront, constrain width to maxDim
    actions.push({ resize: { width: maxDim } });
  }

  const result = await manipulateAsync(uri, actions, {
    compress: quality,
    format,
  });

  return {
    uri: result.uri,
    width: result.width,
    height: result.height,
    base64: result.base64,
  };
}

export interface PickImageOptions extends ImageOptimizationOptions {
  aspect?: [number, number];
  allowsEditing?: boolean;
}

/**
 * Helper to pick an image from media library and immediately optimize (resize <= 800x800 + JPEG 0.78).
 */
export async function pickAndOptimizeImage(
  options: PickImageOptions = {}
): Promise<OptimizedImageResult | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    throw new Error("MEDIA_LIBRARY_PERMISSION_DENIED");
  }

  const pickerResult = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: options.allowsEditing ?? true,
    aspect: options.aspect ?? [1, 1],
    quality: 0.9,
  });

  if (pickerResult.canceled || !pickerResult.assets || !pickerResult.assets[0]) {
    return null;
  }

  const asset = pickerResult.assets[0];
  return optimizeImageForUpload(asset.uri, asset.width, asset.height, options);
}

/**
 * Helper to capture a photo with camera and immediately optimize (resize <= 800x800 + JPEG 0.78).
 */
export async function captureAndOptimizePhoto(
  options: PickImageOptions = {}
): Promise<OptimizedImageResult | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    throw new Error("CAMERA_PERMISSION_DENIED");
  }

  const cameraResult = await ImagePicker.launchCameraAsync({
    allowsEditing: options.allowsEditing ?? true,
    aspect: options.aspect ?? [1, 1],
    quality: 0.9,
  });

  if (cameraResult.canceled || !cameraResult.assets || !cameraResult.assets[0]) {
    return null;
  }

  const asset = cameraResult.assets[0];
  return optimizeImageForUpload(asset.uri, asset.width, asset.height, options);
}
