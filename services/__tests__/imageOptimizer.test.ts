import { optimizeImageForUpload, pickAndOptimizeImage } from "../imageOptimizer";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

jest.mock("expo-image-manipulator", () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: {
    JPEG: "jpeg",
    PNG: "png",
  },
}));

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
}));

describe("imageOptimizer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("optimizeImageForUpload", () => {
    it("resizes images larger than 800px preserving landscape orientation and applies JPEG compression", async () => {
      (manipulateAsync as jest.Mock).mockResolvedValue({
        uri: "file:///optimized.jpg",
        width: 800,
        height: 600,
      });

      const result = await optimizeImageForUpload("file:///raw.jpg", 1600, 1200);

      expect(manipulateAsync).toHaveBeenCalledWith(
        "file:///raw.jpg",
        [{ resize: { width: 800 } }],
        { compress: 0.78, format: SaveFormat.JPEG }
      );
      expect(result.uri).toBe("file:///optimized.jpg");
    });

    it("resizes portrait images larger than 800px by height", async () => {
      (manipulateAsync as jest.Mock).mockResolvedValue({
        uri: "file:///optimized_portrait.jpg",
        width: 600,
        height: 800,
      });

      await optimizeImageForUpload("file:///portrait.jpg", 1200, 1600);

      expect(manipulateAsync).toHaveBeenCalledWith(
        "file:///portrait.jpg",
        [{ resize: { height: 800 } }],
        { compress: 0.78, format: SaveFormat.JPEG }
      );
    });

    it("does not upscale images already smaller than 800px", async () => {
      (manipulateAsync as jest.Mock).mockResolvedValue({
        uri: "file:///small.jpg",
        width: 400,
        height: 400,
      });

      await optimizeImageForUpload("file:///small.jpg", 400, 400);

      expect(manipulateAsync).toHaveBeenCalledWith(
        "file:///small.jpg",
        [],
        { compress: 0.78, format: SaveFormat.JPEG }
      );
    });
  });

  describe("pickAndOptimizeImage", () => {
    it("returns null if user cancels picker", async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "granted",
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: true,
      });

      const result = await pickAndOptimizeImage();
      expect(result).toBeNull();
    });

    it("throws if media library permission is denied", async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "denied",
      });

      await expect(pickAndOptimizeImage()).rejects.toThrow(
        "MEDIA_LIBRARY_PERMISSION_DENIED"
      );
    });
  });
});
